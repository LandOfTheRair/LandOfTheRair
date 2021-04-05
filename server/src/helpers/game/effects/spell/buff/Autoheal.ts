
import { ICharacter, IStatusEffect, DamageArgs } from '../../../../../interfaces';
import { Effect } from '../../../../../models';

export class Autoheal extends Effect {

  public incoming(
    effect: IStatusEffect,
    char: ICharacter,
    attacker: ICharacter | null,
    damageArgs: DamageArgs,
    currentDamage: number
  ): number {

    if (char.hp.current < char.hp.maximum * 0.3) {
      this.sendMessage(char, { message: 'A warm surge of energy runs through your chest!' });
      this.game.characterHelper.healToFull(char);
      effect.endsAt -= (1000 * 150);
    }

    return currentDamage;
  }

}
