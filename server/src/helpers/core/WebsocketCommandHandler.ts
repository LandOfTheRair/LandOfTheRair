
import { Inject, Singleton } from 'typescript-ioc';

import * as Actions from '../../actions';
import { GameServerEvent, IServerAction } from '../../interfaces';
import { Game } from './Game';

@Singleton
export class WebsocketCommandHandler {

  @Inject private game!: Game;

  private actions: { [key: string]: IServerAction } = {};

  public async init() {

    Object.keys(Actions).forEach(actionKey => {
      const action: IServerAction = new Actions[actionKey]();

      this.actions[action.type] = action;
    });

    await this.game.init();
  }

  public async doAction(type: GameServerEvent, data: any) {

    const action = this.actions[type];
    if (!action) throw new Error(`Action type ${type} does not exist.`);

    if (!action.validate(data)) throw new Error(`Action type ${type} is not valid with keys ${JSON.stringify(data)}.`);

    const res = await action.act(this.game, data);
    return res;
  }
}
