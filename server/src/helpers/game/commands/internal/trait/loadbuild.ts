import { IMacroCommandArgs, IPlayer } from '../../../../../interfaces';
import { MacroCommand } from '../../../../../models/macro';

export class LoadBuild extends MacroCommand {

  override aliases = ['loadbuild'];
  override canBeInstant = true;
  override canBeFast = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const slot = this.game.userInputHelper.cleanNumber(+args.stringArgs, 0);
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

    this.game.traitHelper.loadBuild(player, slot);
  }

}
