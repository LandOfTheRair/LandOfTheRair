import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { cleanNumber } from '@lotr/shared';
import { MacroCommand } from '../../../../../models/macro';

export class RenameBuild extends MacroCommand {
  override aliases = ['renamebuild'];
  override canBeInstant = true;
  override canBeFast = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const [baseSlot, newName] = args.arrayArgs;
    const slot = cleanNumber(+baseSlot, 0);
    const maxSlots = this.game.subscriptionHelper.buildSlots(player);

    if (isNaN(slot) || slot < 0 || slot > maxSlots) {
      return this.sendMessage(player, 'Invalid build slot.');
    }

    if (player.combatTicks > 0) {
      return this.sendMessage(player, 'You cannot do that while in combat.');
    }

    if (!this.game.traitHelper.hasBuild(player, slot)) {
      return this.sendMessage(player, 'That build slot is empty.');
    }

    if (!newName) {
      return this.sendMessage(player, 'You must specify a new name.');
    }

    if (newName.length < 3 || newName.length > 20) {
      return this.sendMessage(
        player,
        'The new name must be between 3 and 20 characters.',
      );
    }

    this.game.traitHelper.renameBuild(player, slot, newName);
  }
}
