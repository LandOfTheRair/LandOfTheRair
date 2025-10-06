import type {
  ICharacter,
  IMacroCommandArgs,
  IPlayer,
  PhysicalAttackArgs,
} from '@lotr/interfaces';
import { ItemSlot, Stat } from '@lotr/interfaces';
import { distanceFrom } from '@lotr/shared';
import { SpellCommand } from '../../../../../../models/macro';

export class Rapidpunch extends SpellCommand {
  override aliases = ['rapidpunch', 'art rapidpunch'];
  override requiresLearn = true;

  override mpCost() {
    return 0;
  }

  override canCastSpell() {
    return true;
  }

  override range(char: ICharacter) {
    return 0;
  }

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!args.stringArgs) return false;

    const weapon = player.items.equipment[ItemSlot.RightHand];
    if (weapon) {
      return this.sendMessage(
        player,
        'You cannot punch effectively with an item in your right hand!',
      );
    }

    const target = this.game.targettingHelper.getFirstPossibleTargetInViewRange(
      player,
      args.stringArgs,
    );
    if (!target) return this.youDontSeeThatPerson(player, args.stringArgs);

    if (target === player) return;

    if (distanceFrom(player, target) > this.range(player)) {
      return this.sendMessage(player, 'That target is too far away!');
    }

    this.use(player, target, { attackRange: 0 });
  }

  override use(
    user: ICharacter,
    target: ICharacter,
    opts: PhysicalAttackArgs = {},
  ): void {
    const improvedLevel = this.game.traitHelper.traitLevelValue(
      user,
      'ImprovedRapidpunch',
    );

    const numAttacks = 3 + improvedLevel;
    const damageMult = 0.65;
    const accuracy = this.game.characterHelper.getStat(user, Stat.Accuracy);
    const accuracyLoss = accuracy / (10 + improvedLevel * 2);

    for (let i = 0; i < numAttacks; i++) {
      this.game.combatHelper.physicalAttack(user, target, {
        ...opts,
        isPunch: true,
        damageMult,
        accuracyLoss,
        numAttacks,
        attackNum: i,
      });
    }

    const defensePenalty = 25;
    if (defensePenalty > 0) {
      this.game.effectHelper.addEffect(user, user, 'LoweredDefenses', {
        effect: { extra: { potency: defensePenalty } },
      });
    }
  }
}
