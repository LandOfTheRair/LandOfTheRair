import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { premiumBuildSlots } from '@lotr/premium';
import { cleanNumber } from '@lotr/shared';
import { MacroCommand } from '../../../../../models/macro';

export class SaveBuild extends MacroCommand {
  override aliases = ['savebuild'];
  override canBeInstant = true;
  override canBeFast = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const slot = cleanNumber(+args.stringArgs, 0);
    const maxSlots = premiumBuildSlots(player);

    if (isNaN(slot) || slot < 0 || slot > maxSlots) {
      return this.sendMessage(player, 'Invalid build slot.');
    }

    if (player.combatTicks > 0) {
      return this.sendMessage(player, 'You cannot do that while in combat.');
    }

    this.game.traitHelper.saveBuild(player, slot);
  }
}
