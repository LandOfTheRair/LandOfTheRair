import { MacroCommand } from '@lotr/core';
import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { premiumBuildSlots } from '@lotr/premium';
import { cleanMessage, cleanNumber } from '@lotr/shared';

export class RenameBuild extends MacroCommand {
  override aliases = ['renamebuild'];
  override canBeInstant = true;
  override canBeFast = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const [baseSlot, newName] = args.arrayArgs;
    const slot = cleanNumber(+baseSlot, 0);
    const maxSlots = premiumBuildSlots(player);
    const name = cleanMessage(newName);

    if (isNaN(slot) || slot < 0 || slot > maxSlots) {
      return this.sendMessage(player, 'Invalid build slot.');
    }

    if (player.combatTicks > 0) {
      return this.sendMessage(player, 'You cannot do that while in combat.');
    }

    if (!this.game.traitHelper.hasBuild(player, slot)) {
      return this.sendMessage(player, 'That build slot is empty.');
    }

    if (!name) {
      return this.sendMessage(player, 'You must specify a new name.');
    }

    if (name.length < 3 || name.length > 20) {
      return this.sendMessage(
        player,
        'The new name must be between 3 and 20 characters.',
      );
    }

    this.game.traitHelper.renameBuild(player, slot, newName);

    this.sendMessage(player, `Renamed build slot ${slot + 1} to "${name}".`);
  }
}
