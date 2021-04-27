import { IMacroCommandArgs, IPlayer } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';
import { Game } from '../../../core/Game';

export class GMEval extends MacroCommand {

  override aliases = ['@eval', '@exec'];
  override isGMCommand = true;
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    try {
      const result = this.myEval.call({}, args.stringArgs, {game: this.game, player});
      this.sendMessage(player, `Eval Result: ${result}`);
    } catch (error) {
      this.sendMessage(player, `Eval Error: ${error}`);
    }
  }

  myEval(this: any, script: string, context: any){
    const me = context.player;
    const json = (obj: any) => JSON.stringify(obj, null, 2);
    const props = (obj: any) => Object.getOwnPropertyNames(obj);
    const players = () => ((context.game) as Game).playerManager.getAllPlayers();
    const user = (username: string) => ((context.game) as Game).playerManager.getPlayerByUsername(username);

    // eslint-disable-next-line no-eval
    return eval(script);
  }
}
