import { manaDamage } from '@lotr/characters';
import { traitLevel } from '@lotr/content';
import { hasEffect } from '@lotr/effects';
import type { ICharacter, IStatusEffect } from '@lotr/interfaces';
import { rollTraitValue } from '@lotr/rng';
import { Effect } from '../../../../../models';

export class Song extends Effect {
  // add a generic song buff
  override apply(char: ICharacter) {
    this.game.effectHelper.addEffect(char, char, 'Singing');
  }

  // remove the buff
  override unapply(char: ICharacter) {
    this.game.effectHelper.removeEffectByName(char, 'Singing');
  }

  public override tick(char: ICharacter, effect: IStatusEffect) {
    super.tick(char, effect);

    if (!rollTraitValue(char, 'Ventriloquism')) {
      manaDamage(char, 5);
    }

    if (char.mp.current <= 0) {
      this.sendMessage(char, { message: 'You run out of breath!' });
      this.game.effectHelper.removeEffect(char, effect);
    }

    if (hasEffect(char, 'Hidden') && !traitLevel(char, 'Shadowsong')) {
      this.sendMessage(char, {
        message: 'Your singing gives your position away!',
      });
      this.game.effectHelper.removeEffectByName(char, 'Hidden');
    }
  }
}
