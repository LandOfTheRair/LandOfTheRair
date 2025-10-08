import { traitLevel } from '@lotr/content';
import { calcSkillLevelForCharacter } from '@lotr/exp';
import type { ICharacter, IStatusEffect } from '@lotr/interfaces';
import { DamageClass, Skill, Stat } from '@lotr/interfaces';
import { Effect } from '../../../../../models';

export class Poison extends Effect {
  public override create(char: ICharacter, effect: IStatusEffect) {
    if (effect.sourceUUID) {
      const mapState = this.game.worldManager.getMap(char.map)?.state;
      const caster = mapState?.getCharacterByUUID(effect.sourceUUID);

      if (caster && traitLevel(caster, 'CorrosivePoison')) {
        const skill = calcSkillLevelForCharacter(caster, Skill.Thievery);
        const reduction = Math.floor(skill / 3) + 1;
        effect.effectInfo.statChanges = {
          [Stat.Mitigation]: -reduction,
        };

        effect.effectInfo.tooltip = `${effect.tooltip} -${reduction} Mitigation.`;
      }
    }
  }

  override tick(char: ICharacter, effect: IStatusEffect) {
    super.tick(char, effect);

    let caster: ICharacter | undefined;
    if (effect.sourceUUID) {
      const mapState = this.game.worldManager.getMap(char.map)?.state;
      caster = mapState?.getCharacterByUUID(effect.sourceUUID) ?? undefined;
    }

    this.game.combatHelper.magicalAttack(caster, char, {
      damage: effect.effectInfo.potency,
      damageClass: DamageClass.Poison,
      defMsg: 'You are poisoned!',
    });
  }
}
