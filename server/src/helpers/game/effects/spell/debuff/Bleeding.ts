import { DamageClass, ICharacter, IStatusEffect } from '../../../../../interfaces';
import { Effect } from '../../../../../models';

export class Bleeding extends Effect {

  public override create(char: ICharacter, effect: IStatusEffect) {
    effect.effectInfo.tooltip = `Bleeding and taking ${effect.effectInfo.potency} physical damage per tick.`;
  }

  override tick(char: ICharacter, effect: IStatusEffect) {
    super.tick(char, effect);

    let caster: ICharacter | null = null;
    if (effect.sourceUUID) {
      const mapState = this.game.worldManager.getMap(char.map)?.state;
      caster = mapState?.getCharacterByUUID(effect.sourceUUID) ?? null;
    }

    this.game.combatHelper.magicalAttack(caster, char, {
      damage: effect.effectInfo.potency,
      damageClass: DamageClass.Physical,
      defMsg: 'You are bleeding!'
    });
  }

}
