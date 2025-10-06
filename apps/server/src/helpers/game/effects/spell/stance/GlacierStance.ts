import type {
  DamageArgs,
  ICharacter,
  IStatusEffect } from '@lotr/interfaces';
import {
  DamageClass,
  Skill,
  Stat,
} from '@lotr/interfaces';
import { Effect } from '../../../../../models';

export class GlacierStance extends Effect {
  public override create(char: ICharacter, effect: IStatusEffect) {
    this.game.messageHelper.sendLogMessageToRadius(char, 4, {
      message: `${char.name} takes on an glacial stance.`,
    });

    const skill =
      this.game.characterHelper.getSkillLevel(char, Skill.Conjuration) + 1;

    effect.effectInfo.statChanges = {
      [Stat.Offense]: -skill,
      [Stat.Accuracy]: -skill,
      [Stat.ArmorClass]: skill,
      [Stat.Defense]: skill,
      [Stat.IceBoostPercent]: skill,
    };
  }

  public override incoming(
    effect: IStatusEffect,
    char: ICharacter,
    attacker: ICharacter | null,
    damageArgs: DamageArgs,
    currentDamage: number,
  ): number {
    if (!attacker || damageArgs.damageClass !== DamageClass.Physical) {
return currentDamage;
}
    if (this.game.characterHelper.isDead(attacker)) return currentDamage;

    if (
      this.game.effectHelper.hasEffect(char, 'ImbueFrost') &&
      this.game.characterHelper.hasLearned(char, 'Hail')
    ) {
      this.game.commandHandler.getSkillRef('Hail').use(char, attacker);
    } else {
      this.game.damageHelperMagic.magicalAttack(char, attacker, {
        atkMsg: 'You unleash glacial fury on %0!',
        defMsg: '%0 hit you with a burst of glacial frost!',
        damage: effect.effectInfo.potency,
        damageClass: DamageClass.Ice,
      });
    }

    return currentDamage;
  }
}
