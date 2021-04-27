import { ICharacter, IMacroCommandArgs, IPlayer, ItemSlot, WeaponClasses } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class RiftSlash extends SpellCommand {

  override aliases = ['riftslash', 'cast riftslash'];
  override requiresLearn = true;
  override spellRef = 'RiftSlash';

  override range(char: ICharacter) {
    return 4;
  }

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!args.stringArgs) return false;

    const weapon = player.items.equipment[ItemSlot.RightHand];
    if (!weapon) return this.sendMessage(player, 'You need a weapon in your hand to charge!');

    const weaponClass = this.game.itemHelper.getItemProperty(weapon, 'itemClass');
    if (!WeaponClasses.includes(weaponClass)) return this.sendMessage(player, 'You need a weapon in your hand to charge!');

    const range = this.range(player);
    if (range === -1) return this.sendMessage(player, 'You need to have your left hand empty to use that weapon!');

    this.castSpell(player, args);
  }

}
