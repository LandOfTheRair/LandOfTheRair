import { DamageClass, ICharacter, IStatusEffect, Skill, Stat } from '../../../../../interfaces';
import { Effect } from '../../../../../models';

export class Poison extends Effect {

  public override create(char: ICharacter, effect: IStatusEffect) {

    if (effect.sourceUUID) {
      const mapState = this.game.worldManager.getMap(char.map)?.state;
      const caster = mapState?.getCharacterByUUID(effect.sourceUUID);

      if (caster && this.game.traitHelper.traitLevel(caster, 'CorrosivePoison')) {
        const skill = this.game.calculatorHelper.calcSkillLevelForCharacter(caster, Skill.Thievery);
        const reduction = (Math.floor(skill / 3) + 1);
        effect.effectInfo.statChanges = {
          [Stat.Mitigation]: -reduction
        };

        effect.effectInfo.tooltip = `${effect.tooltip} -${reduction} Mitigation.`;
      }
    }
  }

  override tick(char: ICharacter, effect: IStatusEffect) {
    super.tick(char, effect);

    let caster: ICharacter | null = null;
    if (effect.sourceUUID) {
      const mapState = this.game.worldManager.getMap(char.map)?.state;
      caster = mapState?.getCharacterByUUID(effect.sourceUUID) ?? null;
    }

    this.game.combatHelper.dealDamage(caster, char, {
      damage: effect.effectInfo.potency,
      damageClass: DamageClass.Poison,
      defenderDamageMessage: 'You are poisoned!'
    });
  }

}
