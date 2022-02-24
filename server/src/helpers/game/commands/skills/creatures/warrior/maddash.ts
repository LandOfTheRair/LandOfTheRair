import { ICharacter, IMacroCommandArgs, IPlayer, ItemSlot, WeaponClasses } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class MadDash extends SpellCommand {

  override aliases = ['maddash', 'art maddash'];
  override requiresLearn = true;
  override spellRef = 'MadDash';

  override range(char: ICharacter) {
    return this.calcPlainAttackRange(char);
  }

  override execute(player: IPlayer, args: IMacroCommandArgs) {

    const weapon = player.items.equipment[ItemSlot.RightHand];
    if (!weapon) return this.sendMessage(player, 'You need a weapon in your hand to charge!');

    const weaponClass = this.game.itemHelper.getItemProperty(weapon, 'itemClass');
    if (!WeaponClasses.includes(weaponClass)) return this.sendMessage(player, 'You need a weapon in your hand to charge!');

    const range = this.range(player);
    if (range === -1) return this.sendMessage(player, 'You need to have your left hand empty to use that weapon!');

    const target = this.game.targettingHelper.getFirstPossibleTargetInViewRange(player, args.stringArgs);
    if (!target) return this.youDontSeeThatPerson(player, args.stringArgs);

    if (target === player) return;

    this.use(player, target, { attackRange: range });
  }

}
