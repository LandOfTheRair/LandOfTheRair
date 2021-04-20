import { DamageClass, ICharacter, IStatusEffect } from '../../../../../interfaces';
import { Effect } from '../../../../../models';

export class Regen extends Effect {

  override tick(char: ICharacter, effect: IStatusEffect) {
    super.tick(char, effect);

    let caster: ICharacter | null = null;
    if (effect.sourceUUID) {
      const mapState = this.game.worldManager.getMap(char.map)?.state;
      caster = mapState?.getCharacterByUUID(effect.sourceUUID) ?? null;
    }

    this.game.combatHelper.magicalAttack(caster, char, {
      damage: -effect.effectInfo.potency,
      damageClass: DamageClass.Heal
    });
  }

}
