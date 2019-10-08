import { Injectable } from '@angular/core';

import { QueueingSubject } from 'queueing-subject';

import makeWebSocketObservable, {
  GetWebSocketResponses,
  normalClosureMessage,
  WebSocketOptions,
} from 'rxjs-websockets';

import { Observable, Subject, Subscription } from 'rxjs';
import { map, switchMap, share, retryWhen, delay } from 'rxjs/operators';
import { GameServerEvent, GameServerResponse } from '../models';
import { environment } from '../environments/environment';
import { LoggerService } from './logger.service';
import { Store } from '@ngxs/store';
import { StateReset } from 'ngxs-reset-plugin';
import { CharacterState, AccountState, Logout } from '../stores';

interface WebsocketMessage {
  type: GameServerEvent;
}

type WebsocketExtraMessage = WebsocketMessage & any;

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private isWSConnected: boolean;
  public get isConnected() {
    return this.isWSConnected;
  }

  private socket$: Observable<unknown>;
  private messages$: Subscription;
  private input$: QueueingSubject<WebsocketExtraMessage> = new QueueingSubject<WebsocketExtraMessage>();
  private events: Subject<any> = new Subject();
  public get events$() {
    return this.events;
  }

  private callbacks: {
    [key in GameServerResponse]?: { component: string, callback: (data) => void }[]
  } = {};

  constructor(
    private store: Store,
    private logger: LoggerService
  ) { }

  private makeJsonWebSocketObservable(url: string): Observable<unknown> {

    const options: WebSocketOptions = {
      protocols: [],
      makeWebSocket: (wsurl, protocols) => new WebSocket(wsurl, protocols)
    };

    const socket$ = makeWebSocketObservable<string>(url, options);
    return socket$.pipe(
      map((getResponses: GetWebSocketResponses<string>) =>
        (input$: Observable<object>) =>
          getResponses(
            input$.pipe(
              map(request => JSON.stringify(request)),
            ),
          ).pipe(
            map(response => JSON.parse(response)),
          )
      ),
    );
  }

  private connectStatus(isConnected: boolean) {
    this.isWSConnected = isConnected;

    if (!isConnected) {
      this.store.dispatch(new Logout());
      this.store.dispatch(new StateReset(CharacterState, AccountState));
      this.reconnect();
    }
  }

  init() {
    this.tryDisconnect();

    this.socket$ = this.makeJsonWebSocketObservable(environment.server.ws);

    const messages$ = this.socket$.pipe(
      switchMap((getResponses: any) => {
        this.connectStatus(true);
        this.logger.debug(`[WS CN]`, `Connected to server!`);
        return getResponses(this.input$);
      }),
      retryWhen(errors => errors.pipe(delay(1000))),
      share()
    );

    this.messages$ = messages$.subscribe({

      next: (message: any) => {
        this.logger.debug(`[WS RECV]`, message);

        // auto dispatch event based on `type`
        if (message.type) {
          this.store.dispatch({ ...message, type: message.type });
        }

        this.events.next(message);

        this.handleCallback(message);
      },

      error: (error: Error) => {
        this.connectStatus(false);

        const { message } = error;
        const sendMessage = message || 'No specified error; look for a red line starting with "WebSocket connection to ... failed:"';
        if (message === normalClosureMessage) {
          this.logger.debug(`[WS DC]`, `Closed normally.`);
        } else {
          this.logger.debug(`[WS DC]`, `Closed due to error:`, sendMessage);
        }
      },

      complete: () => {
        this.connectStatus(false);

        this.logger.debug(`[WS DC]`, `Closed via observable completion.`);
      },
    });

    (window as any).__rawSendSocketData = (t, d) => this.emit(t, d);
  }

  tryDisconnect() {
    if (!this.messages$) return;
    this.messages$.unsubscribe();
  }

  emit(type: GameServerEvent, data: any = {}) {
    this.input$.next({ type, ...data });
  }

  private reconnect() {
    const interval = setInterval(() => {
      if (this.isConnected) {
        clearInterval(interval);
        return;
      }

      this.init();
    }, 5000);
  }

  private handleCallback(data: any): void {
    const { type, ...other } = data;

    if (!type) {
      this.logger.error(`[WS Callback]`, `Payload ${JSON.stringify(data)} has no type.`);
      return;
    }

    if (!this.callbacks[type] || this.callbacks[type].length === 0) {
      this.logger.error(`[WS Callback]`, `Type ${type} has no callbacks registered.`);
      return;
    }

    this.callbacks[type].forEach(({ callback }) => callback(other));
  }

  registerComponentCallback(component: string, type: GameServerResponse, callback: (data) => void) {
    this.callbacks[type] = this.callbacks[type] || [];
    this.callbacks[type].push({ component, callback });
  }

  unregisterComponentCallbacks(component: string): void {
    Object.keys(this.callbacks).forEach(type => {
      this.callbacks[type] = this.callbacks[type].filter(x => x.component !== component);
    });
  }
}
