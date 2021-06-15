import { IMacroCommandArgs, IPlayer } from '../../../../../interfaces';
import { MacroCommand } from '../../../../../models/macro';


export class RemoveEffectCommand extends MacroCommand {

  override aliases = ['removeeffect'];
  override canBeInstant = true;
  override canBeFast = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    this.game.effectHelper.removeEffectManually(player, args.stringArgs.trim(), true);
  }

}
