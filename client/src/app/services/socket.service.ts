import { Injectable } from '@angular/core';

import { QueueingSubject } from 'queueing-subject';

import makeWebSocketObservable, {
  GetWebSocketResponses,
  normalClosureMessage
} from 'rxjs-websockets';

import { Store } from '@ngxs/store';
import { StateReset } from 'ngxs-reset-plugin';
import { BehaviorSubject, interval, Observable, Subject, Subscription } from 'rxjs';
import { delay, map, retryWhen, share, switchMap, tap } from 'rxjs/operators';
import { GameServerEvent, GameServerResponse } from '../../interfaces';
import { AccountState, GameState, Logout } from '../../stores';
import { LoggerService } from './logger.service';
import { APIService } from './api.service';

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

  private wsConnected: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public get wsConnected$() {
    return this.wsConnected.asObservable();
  }

  private socket$: Observable<unknown>;
  private messages$: Subscription;
  private input$: QueueingSubject<WebsocketExtraMessage> = new QueueingSubject<WebsocketExtraMessage>();
  private events: Subject<any> = new Subject();
  public get events$() {
    return this.events;
  }

  private callbacks: {
    [key in GameServerResponse]?: { component: string; callback: (data) => void }[]
  } = {};

  private commandQueue = [];

  constructor(
    private store: Store,
    private logger: LoggerService,
    private api: APIService
  ) { }

  private makeJsonWebSocketObservable(url: string): Observable<unknown> {

    const socket$ = makeWebSocketObservable<string>(url);
    return socket$.pipe(
      map((getResponses: GetWebSocketResponses<string>) =>
        (input$: Observable<any>) =>
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

    this.wsConnected.next(isConnected);

    if (!isConnected) {
      this.store.dispatch(new Logout());

      // any time a new state is added and needs to be reset, it has to be added to this list
      this.store.dispatch(new StateReset(AccountState, GameState));
    }
  }

  init() {
    this.startMessageQueueAutomaticSender();

    this.tryDisconnect();

    this.socket$ = this.makeJsonWebSocketObservable(this.api.finalWSURL);

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

        // auto dispatch event based on `action`
        if (message.action) {
          this.store.dispatch({ type: message.action, ...message });
          return;

        // if there is no action, log it. otherwise it's redundant.
        } else {
          this.logger.debug(`[WS RECV]`, message);
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

    // eslint-disable-next-line no-underscore-dangle
    (window as any).__rawSendSocketData = (t, d) => this.emit(t, d);
  }

  tryDisconnect() {
    if (this.messages$) this.messages$.unsubscribe();
  }

  startMessageQueueAutomaticSender() {
    interval(100)
      .subscribe(() => {
        const sendCommands = [];
        for (let i = 0; i < 5; i++) {
          sendCommands.push(this.commandQueue.shift());
        }

        sendCommands.forEach(cmd => {
          if (!cmd) return;
          this.emit(GameServerEvent.DoCommand, cmd);
        });
      });
  }

  sendAction(data: any = {}) {
    this.commandQueue.push(data);
  }

  emit(type: GameServerEvent, data: any = {}) {
    const message = { type, ...data };
    this.logger.debug(`[WS EMIT]`, message);
    this.input$.next(message);
  }

  private handleCallback(data: any): void {
    const { type, ...other } = data;

    if (!type) {
      this.logger.error(`WSCallback`, `Payload ${JSON.stringify(data)} has no type.`);
      return;
    }

    if (!this.callbacks[type] || this.callbacks[type].length === 0) {
      const blacklist = ['error', GameServerResponse.PlayCFX];
      if (blacklist.includes(type)) return;

      this.logger.error(`WSCallback`, `Type ${type} has no callbacks registered.`);
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
