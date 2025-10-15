export interface IWebsocketCommandHandler {
  sendToSocket(username: string, data: any): void;
  broadcast(data: any): void;
}
