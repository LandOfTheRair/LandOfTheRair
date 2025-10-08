import type { ICharacter, IStatusEffect } from '@lotr/interfaces';
import { DamageClass } from '@lotr/interfaces';
import { Effect } from '../../../../../models';

export class Regen extends Effect {
  override tick(char: ICharacter, effect: IStatusEffect) {
    super.tick(char, effect);

    let caster: ICharacter | undefined;
    if (effect.sourceUUID) {
      const mapState = this.game.worldManager.getMap(char.map)?.state;
      caster = mapState?.getCharacterByUUID(effect.sourceUUID) ?? undefined;
    }

    this.game.combatHelper.magicalAttack(caster, char, {
      damage: -effect.effectInfo.potency,
      damageClass: DamageClass.Heal,
    });
  }
}
