import {
  GameServerResponse,
  IMacroCommandArgs,
  IPlayer,
} from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';
import { Game } from '../../../core/Game';

export class GMEval extends MacroCommand {
  override aliases = ['@eval', '@exec', '@evalj'];
  override isGMCommand = true;
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    try {
      const result = this.myEval.call({}, args.stringArgs, {
        game: this.game,
        player,
      });
      switch (args.calledAlias) {
        case '@exec': {
          this.sendMessage(player, 'Command Executed');
          break;
        }

        case '@evalj': {
          this.sendMessage(
            player,
            `Command Result<br>${JSON.stringify(result, null, 2).replace(/\n/g, '<br>')}`,
          );

          args.callbacks.emit({
            type: GameServerResponse.SendAlert,
            title: `Command Result`,
            content: JSON.stringify(result, null, 2),
          });
          break;
        }

        default: {
          this.sendMessage(player, `Command Result<br>${result}`);
          args.callbacks.emit({
            type: GameServerResponse.SendAlert,
            title: `Command Result`,
            content: result,
          });
          break;
        }
      }
    } catch (error) {
      this.sendMessage(player, `Eval Error: ${error}`);
    }
  }

  /**
   * Evaluate a string of code.
   * Properties you'll have access to when you write a js function:
   * * me - this is the player executing the function
   * * game - a reference to the game object, which should let you do basically anything
   *
   * Functions you'll have access to when you write a js function:
   * * json(obj) - serialize an object to a json string
   * * props(obj) - get the property names of an object
   * * players() - get all players in the game
   * * user(username) - get a player by username
   */
  myEval(this: any, script: string, context: any) {
    const me = context.player;
    const game = context.game;
    const json = (obj: any) => JSON.stringify(obj, null, 2);
    const props = (obj: any) => Object.getOwnPropertyNames(obj);
    const players = () => (context.game as Game).playerManager.getAllPlayers();
    const user = (username: string) =>
      (context.game as Game).playerManager.getPlayerByUsername(username);

    // eslint-disable-next-line no-eval
    return eval(script);
  }
}
