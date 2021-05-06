import { distanceFrom, ICharacter, IMacroCommandArgs, IPlayer, ItemSlot } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Mug extends SpellCommand {

  override aliases = ['mug'];
  override requiresLearn = true;
  override spellRef = 'Mug';

  override range(): number {
    return 0;
  }

  override canUse(char: ICharacter, target: ICharacter): boolean {
    if (!this.game.characterHelper.hasEmptyHand(char)) return false;

    const rightHand = char.items.equipment[ItemSlot.RightHand];

    if (rightHand) {
      const twoHanded = this.game.itemHelper.getItemProperty(rightHand, 'twoHanded');
      if (twoHanded) return false;
    }

    return distanceFrom(char, target) > 0
        && (this.game.currencyHelper.getCurrency(char) > 0 || target.items.sack.items.length > 0);
  }

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const target = this.game.targettingHelper.getFirstPossibleTargetInViewRange(player as IPlayer, args.stringArgs);
    if (!target) return this.youDontSeeThatPerson(player as IPlayer, args.stringArgs);

    if (target === player) return;

    const rightHand = player.items.equipment[ItemSlot.RightHand];

    if (!rightHand) return this.sendMessage(player, 'You need an item in your right hand to mug someone!');

    if (rightHand) {
      const twoHanded = this.game.itemHelper.getItemProperty(rightHand, 'twoHanded');
      if (twoHanded) return this.sendMessage(player, 'That weapon is too heavy to mug with!');
    }

    this.game.movementHelper.moveTowards(player, target);

    if (distanceFrom(player, target) > 0) return this.sendMessage(player, 'That target is too far away!');

    this.use(player, target);
  }

  override use(char: ICharacter, target: ICharacter): void {
    this.game.stealHelper.trySteal(char, target);

    const res = this.game.combatHelper.physicalAttack(char, target, { isMug: true, attackRange: this.range() });

    if (res.hit) {
      this.game.stealHelper.trySteal(char, target);
    }

  }

}
