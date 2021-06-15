import { IMacroCommandArgs, IPlayer } from '../../../../../interfaces';
import { MacroCommand } from '../../../../../models/macro';


export class RemoveSongCommand extends MacroCommand {

  override aliases = ['removesong'];
  override canBeInstant = true;
  override canBeFast = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    this.game.effectHelper.removeEffectManually(player, args.stringArgs.trim());
  }

}
