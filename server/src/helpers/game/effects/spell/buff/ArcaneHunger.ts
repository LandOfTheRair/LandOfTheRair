import { ICharacter, IStatusEffect } from '../../../../../interfaces';
import { Effect } from '../../../../../models';

export class ArcaneHunger extends Effect {
  public override create(char: ICharacter, effect: IStatusEffect) {
    const charges = effect.effectInfo.charges ?? 1;
    effect.effectInfo.tooltip = `Spell cost +${charges * 20}% MP and deal +${charges * 10}% more damage.`;
  }
}
