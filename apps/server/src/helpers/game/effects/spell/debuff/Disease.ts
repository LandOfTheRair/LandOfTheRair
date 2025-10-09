import { traitLevelValue } from '@lotr/content';
import { calcSkillLevelForCharacter } from '@lotr/exp';
import type { ICharacter, IStatusEffect } from '@lotr/interfaces';
import { DamageClass, Skill, Stat } from '@lotr/interfaces';
import { Effect } from '../../../../../models';

export class Disease extends Effect {
  public override create(char: ICharacter, effect: IStatusEffect) {
    if (effect.sourceUUID) {
      const mapState = this.game.worldManager.getMap(char.map)?.state;
      const caster = mapState?.getCharacterByUUID(effect.sourceUUID);

      if (caster) {
        const mult = traitLevelValue(caster, 'DebilitatingDisease');
        const skill = calcSkillLevelForCharacter(caster, Skill.Restoration);
        const statReduction = -Math.floor(skill * mult);

        if (statReduction > 0) {
          effect.effectInfo.statChanges = {
            [Stat.CON]: statReduction,
            [Stat.WIL]: statReduction,
            [Stat.Accuracy]: statReduction,
          };

          effect.effectInfo.tooltip = `${effect.tooltip} ${statReduction} CON/WIL/Accuracy.`;
        }
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
      damageClass: DamageClass.Disease,
      isOverTime: true,
      atkMsg: 'Your disease hurts %0!',
      defMsg: 'You are diseased!',
    });
  }
}
