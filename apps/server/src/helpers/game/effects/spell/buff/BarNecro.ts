import { traitLevelValue } from '@lotr/content';
import { worldGetMapAndState } from '@lotr/core';
import type { ICharacter, IStatusEffect } from '@lotr/interfaces';
import { Stat } from '@lotr/interfaces';
import { Effect } from '../../../../../models';

export class BarNecro extends Effect {
  public override create(char: ICharacter, effect: IStatusEffect) {
    let boost = 1;

    if (effect.sourceUUID) {
      const mapState = worldGetMapAndState(char.map)?.state;
      const caster = mapState?.getCharacterByUUID(effect.sourceUUID);

      if (caster) {
        boost += traitLevelValue(caster, 'NecroticWard');
      }
    }

    effect.effectInfo.potency = Math.floor(boost * effect.effectInfo.potency);

    effect.effectInfo.statChanges = {
      [Stat.NecroticResist]: effect.effectInfo.potency,
      [Stat.PoisonResist]: Math.floor(effect.effectInfo.potency / 5),
      [Stat.DiseaseResist]: Math.floor(effect.effectInfo.potency / 10),
    };
  }
}
