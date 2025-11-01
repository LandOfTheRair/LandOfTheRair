import { worldGetMapAndState } from '@lotr/core';
import type { ICharacter, IStatusEffect } from '@lotr/interfaces';
import { DamageClass } from '@lotr/interfaces';
import { Effect } from '../../../../../models';

export class CurseDecay extends Effect {
  override tick(char: ICharacter, effect: IStatusEffect) {
    super.tick(char, effect);

    let caster: ICharacter | undefined;
    if (effect.sourceUUID) {
      const mapState = worldGetMapAndState(char.map)?.state;
      caster = mapState?.getCharacterByUUID(effect.sourceUUID) ?? undefined;
    }

    const damage = Math.floor(char.hp.maximum / 100);

    this.game.combatHelper.magicalAttack(caster, char, {
      damage,
      damageClass: DamageClass.Sonic,
      atkMsg: 'You shredded the flesh of %0!',
      defMsg: 'You are decaying!',
    });
  }
}
