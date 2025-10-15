import type { IWebsocketCommandHandler } from '@lotr/interfaces';
import { consoleError } from '@lotr/logger';

let wsCmdHandler: IWebsocketCommandHandler | undefined;

export function wsSetHandler(ws: IWebsocketCommandHandler) {
  if (wsCmdHandler) {
    consoleError(
      'WSCmdHandler',
      new Error('WebSocket command handler already set.'),
    );
    return;
  }

  wsCmdHandler = ws;
}

export function wsSendToSocket(username: string, data: any) {
  if (!wsCmdHandler) {
    consoleError(
      'WSCmdHandler',
      new Error('WebSocket command handler not set.'),
    );
    return;
  }

  wsCmdHandler.sendToSocket(username, data);
}

export function wsBroadcast(data: any) {
  if (!wsCmdHandler) {
    consoleError(
      'WSCmdHandler',
      new Error('WebSocket command handler not set.'),
    );
    return;
  }

  wsCmdHandler.broadcast(data);
}
