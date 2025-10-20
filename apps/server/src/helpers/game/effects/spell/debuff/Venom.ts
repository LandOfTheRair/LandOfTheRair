import { traitLevel } from '@lotr/content';
import { worldGetMapAndState } from '@lotr/core';
import { calcSkillLevelForCharacter } from '@lotr/exp';
import type { ICharacter, IStatusEffect } from '@lotr/interfaces';
import { DamageClass, Skill, Stat } from '@lotr/interfaces';
import { Effect } from '../../../../../models';

export class Venom extends Effect {
  public override create(char: ICharacter, effect: IStatusEffect) {
    if (effect.sourceUUID) {
      const mapState = worldGetMapAndState(char.map)?.state;
      const caster = mapState?.getCharacterByUUID(effect.sourceUUID);

      if (caster && traitLevel(caster, 'DegenerativeVenom')) {
        const skill = calcSkillLevelForCharacter(caster, Skill.Thievery);
        const reduction = skill + 1;
        effect.effectInfo.statChanges = {
          [Stat.Perception]: -reduction,
        };

        effect.effectInfo.tooltip = `${effect.tooltip} -${reduction} Perception.`;
      }
    }
  }

  override tick(char: ICharacter, effect: IStatusEffect) {
    super.tick(char, effect);

    let caster: ICharacter | undefined;
    if (effect.sourceUUID) {
      const mapState = worldGetMapAndState(char.map)?.state;
      caster = mapState?.getCharacterByUUID(effect.sourceUUID) ?? undefined;
    }

    this.game.combatHelper.magicalAttack(caster, char, {
      damage: effect.effectInfo.potency,
      damageClass: DamageClass.Poison,
      isOverTime: true,
      atkMsg: 'Your venom hurts %0!',
      defMsg: 'You are suffering from venom!',
    });
  }
}
