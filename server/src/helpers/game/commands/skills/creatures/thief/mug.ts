import { ICharacter, IMacroCommandArgs, IPlayer, ItemSlot } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Mug extends SpellCommand {

  aliases = ['mug'];
  requiresLearn = true;
  spellRef = 'Mug';

  range() {
    return 0;
  }

  canUse(char: ICharacter, target: ICharacter): boolean {
    if (!this.game.characterHelper.hasEmptyHand(char)) return false;

    const rightHand = char.items.equipment[ItemSlot.RightHand];

    if (rightHand) {
      const twoHanded = this.game.itemHelper.getItemProperty(rightHand, 'twoHanded');
      if (twoHanded) return false;
    }

    return this.game.directionHelper.distFrom(char, target) > 0
        && (this.game.currencyHelper.getCurrency(char) > 0 || target.items.sack.items.length > 0);
  }

  execute(player: IPlayer, args: IMacroCommandArgs) {
    const target = this.game.targettingHelper.getFirstPossibleTargetInViewRange(player as IPlayer, args.stringArgs);
    if (!target) return this.youDontSeeThatPerson(player as IPlayer, args.stringArgs);

    if (target === player) return;

    if (!player.items.equipment[ItemSlot.RightHand]) return this.sendMessage(player, 'You need an item in your right hand to mug someone!');

    this.game.movementHelper.moveTowards(player, target);

    if (this.game.directionHelper.distFrom(player, target) > 0) return this.sendMessage(player, 'That target is too far away!');

    this.use(player, target);
  }

  use(char: ICharacter, target: ICharacter): void {
    this.game.stealHelper.trySteal(char, target);

    const res = this.game.combatHelper.physicalAttack(char, target, { isMug: true, attackRange: this.range() });

    if (res.hit) {
      this.game.stealHelper.trySteal(char, target);
    }

  }

}
