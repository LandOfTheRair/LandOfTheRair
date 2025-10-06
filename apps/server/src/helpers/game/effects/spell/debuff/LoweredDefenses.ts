import type { ICharacter, IStatusEffect } from '@lotr/interfaces';
import { Stat } from '@lotr/interfaces';
import { Effect } from '../../../../../models';

export class LoweredDefenses extends Effect {
  public override create(char: ICharacter, effect: IStatusEffect) {
    const potency = effect.effectInfo.potency;
    effect.effectInfo.statChanges = {
      [Stat.Mitigation]: Math.floor(
        this.game.characterHelper.getStat(char, Stat.Mitigation) *
          (potency / 100),
      ),
      [Stat.ArmorClass]: Math.floor(
        this.game.characterHelper.getStat(char, Stat.ArmorClass) *
          (potency / 100),
      ),
      [Stat.Defense]: Math.floor(
        this.game.characterHelper.getStat(char, Stat.Defense) * (potency / 100),
      ),
    };
  }
}
