import { traitLevelValue } from '@lotr/content';
import type { ICharacter, IStatusEffect } from '@lotr/interfaces';
import { Stat } from '@lotr/interfaces';
import { Effect } from '../../../../models';

export class Nourishment extends Effect {
  public override create(char: ICharacter, effect: IStatusEffect) {
    // do slow digestion
    const slowDigestion = traitLevelValue(char, 'SlowDigestion');
    if (slowDigestion) {
      const duration = effect.endsAt - Date.now();
      effect.endsAt = Date.now() + duration * (1 + slowDigestion);
    }

    // do sweet tooth
    effect.effectInfo.statChanges = effect.effectInfo.statChanges || {};
    effect.effectInfo.statChanges[Stat.HPRegen] =
      effect.effectInfo.statChanges[Stat.HPRegen] ?? 0;
    effect.effectInfo.statChanges[Stat.MPRegen] =
      effect.effectInfo.statChanges[Stat.MPRegen] ?? 0;

    const sweetTooth = traitLevelValue(char, 'SweetTooth');

    effect.effectInfo.statChanges[Stat.HPRegen]! += sweetTooth;
    effect.effectInfo.statChanges[Stat.MPRegen]! += sweetTooth;

    if (sweetTooth) {
      effect.effectInfo.tooltip = `${effect.effectInfo.tooltip}; +${sweetTooth} HP/MP Regen`;
    }
  }

  override apply(char: ICharacter, effect: IStatusEffect) {
    if (effect.effectInfo.message) {
      this.sendMessage(char, { message: effect.effectInfo.message });
    }

    this.game.effectHelper.removeEffectByName(char, 'Malnourished');
    this.game.effectHelper.removeEffectByName(char, 'Sated');
  }

  override unapply(char: ICharacter) {
    this.game.effectHelper.addEffect(char, '', 'Sated', {
      effect: { duration: 21600 },
    });
  }
}
