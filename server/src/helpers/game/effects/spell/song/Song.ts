import { ICharacter, IStatusEffect } from '../../../../../interfaces';
import { Effect } from '../../../../../models';

export class Song extends Effect {

  public override tick(char: ICharacter, effect: IStatusEffect) {
    super.tick(char, effect);

    if (this.game.effectHelper.hasEffect(char, 'Hidden')) {
      this.sendMessage(char, { message: 'Your singing gives your position away!' });
      this.game.effectHelper.removeEffectByName(char, 'Hidden');
    }
  }

}
