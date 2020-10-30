import { Injectable } from '@angular/core';

import { QueueingSubject } from 'queueing-subject';

import makeWebSocketObservable, {
  GetWebSocketResponses,
  normalClosureMessage
} from 'rxjs-websockets';

import { Store } from '@ngxs/store';
import { StateReset } from 'ngxs-reset-plugin';
import { Observable, Subject, Subscription } from 'rxjs';
import { delay, map, retryWhen, share, switchMap, tap } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { GameServerEvent, GameServerResponse } from '../interfaces';
import { AccountState, CharacterState, GameState, Logout } from '../stores';
import { LoggerService } from './logger.service';

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

    const socket$ = makeWebSocketObservable<string>(url);
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

      // any time a new state is added and needs to be reset, it has to be added to this list
      this.store.dispatch(new StateReset(CharacterState, AccountState, GameState));
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
      retryWhen(errors => errors.pipe(
        tap(() => this.connectStatus(false)),
        delay(5000)
      )),
      share()
    );

    this.messages$ = messages$.subscribe({

      next: (message: any) => {
        this.logger.debug(`[WS RECV]`, message);

        // auto dispatch event based on `action`
        if (message.action) {
          this.store.dispatch({ type: message.action, ...message });
          return;
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
    if (this.messages$) this.messages$.unsubscribe();
  }

  sendAction(data: any = {}) {
    this.emit(GameServerEvent.DoCommand, data);
  }

  emit(type: GameServerEvent, data: any = {}) {
    const message = { type, ...data };
    this.logger.debug(`[WS EMIT]`, message);
    this.input$.next(message);
  }

  private handleCallback(data: any): void {
    const { type, ...other } = data;

    if (!type) {
      this.logger.error(`[WS Callback]`, `Payload ${JSON.stringify(data)} has no type.`);
      return;
    }

    if (!this.callbacks[type] || this.callbacks[type].length === 0) {
      if (type === 'error') return;

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
