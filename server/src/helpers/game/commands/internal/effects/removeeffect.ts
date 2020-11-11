import { IMacroCommandArgs, IPlayer } from '../../../../../interfaces';
import { MacroCommand } from '../../../../../models/macro';


export class RemoveEffectCommand extends MacroCommand {

  aliases = ['removeeffect'];
  canBeInstant = true;
  canBeFast = true;

  execute(player: IPlayer, args: IMacroCommandArgs) {
    this.game.effectHelper.removeEffectManually(player, args.stringArgs.trim());
  }

}
