import { hasEmptyHand } from '@lotr/characters';
import { getCurrency } from '@lotr/currency';
import type { ICharacter, IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { ItemSlot } from '@lotr/interfaces';
import { distanceFrom } from '@lotr/shared';
import { SkillCommand } from '../../../../models/macro';

export class Steal extends SkillCommand {
  override aliases = ['steal'];
  override canBeInstant = false;
  override canBeFast = false;

  override range(): number {
    return 0;
  }

  override canUse(char: ICharacter, target: ICharacter): boolean {
    if (!hasEmptyHand(char)) return false;

    const rightHand = char.items.equipment[ItemSlot.RightHand];

    if (rightHand) {
      const twoHanded = this.game.itemHelper.getItemProperty(
        rightHand,
        'twoHanded',
      );
      if (twoHanded && !this.game.traitHelper.traitLevel(char, 'TitanGrip')) {
        return false;
      }
    }

    return (
      distanceFrom(char, target) === 0 &&
      (getCurrency(char) > 0 || target.items.sack.items.length > 0)
    );
  }

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const target = this.game.targettingHelper.getFirstPossibleTargetInViewRange(
      player as IPlayer,
      args.stringArgs,
    );
    if (!target) {
      return this.youDontSeeThatPerson(player as IPlayer, args.stringArgs);
    }

    if (target === player) return;

    this.game.movementHelper.moveTowards(player, target);

    if (distanceFrom(player, target) > 0) {
      return this.sendMessage(player, 'That target is too far away!');
    }

    this.use(player, target);
  }

  override use(char: ICharacter, target: ICharacter): void {
    this.game.stealHelper.trySteal(char, target);
  }
}
