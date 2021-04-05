import { DamageClass, ICharacter, IStatusEffect } from '../../../../../interfaces';
import { Effect } from '../../../../../models';

export class Disease extends Effect {

  override tick(char: ICharacter, effect: IStatusEffect) {
    super.tick(char, effect);

    let caster: ICharacter | null = null;
    if (effect.sourceUUID) {
      const mapState = this.game.worldManager.getMap(char.map).state;
      caster = mapState.getCharacterByUUID(effect.sourceUUID);
    }

    this.game.combatHelper.dealDamage(caster, char, {
      damage: effect.effectInfo.potency,
      damageClass: DamageClass.Disease,
      defenderDamageMessage: 'You are diseased!'
    });
  }

}
