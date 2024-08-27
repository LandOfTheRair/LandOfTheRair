import { ICharacter, IPlayer, IStatusEffect } from '../../../../interfaces';
import { Effect } from '../../../../models';

export class GainSilver extends Effect {
  override apply(char: ICharacter, effect: IStatusEffect) {
    const potency = effect.effectInfo.potency;
    this.game.subscriptionHelper.gainSilver(char as IPlayer, potency);
    this.sendMessage(char, { message: `You got ${potency} silver!` });
  }
}
