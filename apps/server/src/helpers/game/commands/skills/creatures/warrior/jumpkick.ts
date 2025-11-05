import { getStat, isUtilizingMartialWeapon } from '@lotr/characters';
import { traitHasLearned, traitLevel } from '@lotr/content';
import { SpellCommand } from '@lotr/core';
import type {
  ICharacter,
  IMacroCommandArgs,
  IPlayer,
  PhysicalAttackArgs,
} from '@lotr/interfaces';
import { ItemSlot, Stat } from '@lotr/interfaces';

export class Jumpkick extends SpellCommand {
  override aliases = ['jumpkick', 'art jumpkick'];
  override requiresLearn = true;

  override range(char: ICharacter) {
    return getStat(char, Stat.Move);
  }

  override mpCost() {
    return 0;
  }

  override canCastSpell() {
    return true;
  }

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!args.stringArgs) return false;

    const weapon = player.items.equipment[ItemSlot.RightHand];
    const canUseMartialWeapon =
      traitHasLearned(player, 'MartialWeapons') &&
      isUtilizingMartialWeapon(player);

    if (weapon && !canUseMartialWeapon) {
      return this.sendMessage(
        player,
        'You cannot maneuver effectively with that item in your right hand!',
      );
    }

    const target = this.game.targettingHelper.getFirstPossibleTargetInViewRange(
      player,
      args.stringArgs,
    );
    if (!target) return this.youDontSeeThatPerson(player, args.stringArgs);

    if (target === player) return;

    this.use(player, target);
  }

  override use(
    user: ICharacter,
    target: ICharacter,
    opts: PhysicalAttackArgs = {},
  ): void {
    this.game.movementHelper.moveTowards(user, target);

    this.game.combatHelper.physicalAttack(user, target, {
      ...opts,
      isKick: true,
    });

    if (traitLevel(user, 'Punchkick')) {
      this.game.combatHelper.physicalAttack(user, target, {
        ...opts,
        isPunch: true,
      });
    }
  }
}
