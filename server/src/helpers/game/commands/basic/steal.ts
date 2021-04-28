import { ICharacter, IMacroCommandArgs, IPlayer, ItemSlot } from '../../../../interfaces';
import { SkillCommand } from '../../../../models/macro';

export class Steal extends SkillCommand {

  override aliases = ['steal'];
  override canBeInstant = false;
  override canBeFast = false;

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

    return this.game.directionHelper.distFrom(char, target) === 0
        && (this.game.currencyHelper.getCurrency(char) > 0 || target.items.sack.items.length > 0);
  }

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const target = this.game.targettingHelper.getFirstPossibleTargetInViewRange(player as IPlayer, args.stringArgs);
    if (!target) return this.youDontSeeThatPerson(player as IPlayer, args.stringArgs);

    if (target === player) return;

    this.game.movementHelper.moveTowards(player, target);

    if (this.game.directionHelper.distFrom(player, target) > 0) return this.sendMessage(player, 'That target is too far away!');

    this.use(player, target);
  }

  override use(char: ICharacter, target: ICharacter): void {
    this.game.stealHelper.trySteal(char, target);
  }
}
