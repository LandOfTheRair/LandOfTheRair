import { getSkillLevel, hasLearned, isDead } from '@lotr/characters';
import { hasEffect } from '@lotr/effects';
import type { DamageArgs, ICharacter, IStatusEffect } from '@lotr/interfaces';
import { DamageClass, Skill, Stat } from '@lotr/interfaces';
import { Effect } from '../../../../../models';

export class WizardStance extends Effect {
  public override create(char: ICharacter, effect: IStatusEffect) {
    this.game.messageHelper.sendLogMessageToRadius(char, 4, {
      message: `${char.name} takes on a wizardly stance.`,
    });

    const skill = getSkillLevel(char, Skill.Conjuration) + 1;

    this.game.effectHelper.removeEffectByName(char, 'Absorption');
    this.game.effectHelper.removeEffectByName(char, 'Protection');

    const absorptionData = this.game.spellManager.getSpellData(
      'Absorption',
      `WS:${char.name}`,
    );
    const protectionData = this.game.spellManager.getSpellData(
      'Protection',
      `WS:${char.name}`,
    );

    const absorptionPotency = this.game.spellManager.getPotency(
      char,
      char,
      absorptionData,
    );
    const protectionPotency = this.game.spellManager.getPotency(
      char,
      char,
      protectionData,
    );

    effect.effectInfo.statChanges = {
      [Stat.PhysicalResist]: Math.floor(protectionPotency * 1.5),
      [Stat.MagicalResist]: Math.floor(absorptionPotency * 1.5),
      [Stat.EnergyBoostPercent]: skill,
    };
  }

  public override incoming(
    effect: IStatusEffect,
    char: ICharacter,
    attacker: ICharacter | undefined,
    damageArgs: DamageArgs,
    currentDamage: number,
  ): number {
    if (!attacker || damageArgs.damageClass === DamageClass.Physical) {
      return currentDamage;
    }
    if (isDead(attacker)) return currentDamage;

    if (hasEffect(char, 'ImbueEnergy') && hasLearned(char, 'MagicMissile')) {
      this.game.commandHandler.getSkillRef('MagicMissile').use(char, attacker);
    } else {
      this.game.damageHelperMagic.magicalAttack(char, attacker, {
        atkMsg: 'You unleash energetic fury on %0!',
        defMsg: '%0 hit you with a burst of energetic power!',
        damage: effect.effectInfo.potency,
        damageClass: DamageClass.Energy,
      });
    }

    return currentDamage;
  }
}
