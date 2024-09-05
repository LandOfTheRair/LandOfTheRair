import { ICharacter, IStatusEffect, Stat } from '../../../../../interfaces';
import { Effect } from '../../../../../models';

export class Aid extends Effect {
  public override create(char: ICharacter, effect: IStatusEffect) {
    const potency = effect.effectInfo.potency ?? 0;

    const dexBoost = Math.max(1, Math.floor(potency / 5));
    const offenseBoost = potency;

    effect.effectInfo.statChanges = {
      [Stat.DEX]: dexBoost,
      [Stat.Offense]: offenseBoost,
    };
  }
}
