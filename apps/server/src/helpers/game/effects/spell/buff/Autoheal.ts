import { healToFull } from '@lotr/characters';
import type { DamageArgs, ICharacter, IStatusEffect } from '@lotr/interfaces';
import { Effect } from '../../../../../models';

export class Autoheal extends Effect {
  public override incoming(
    effect: IStatusEffect,
    char: ICharacter,
    attacker: ICharacter | undefined,
    damageArgs: DamageArgs,
    currentDamage: number,
  ): number {
    if (char.hp.current < char.hp.maximum * 0.3) {
      this.sendMessage(char, {
        message: 'A warm surge of energy runs through your chest!',
      });
      healToFull(char);
      effect.endsAt -= 1000 * 150;
    }

    return currentDamage;
  }
}
