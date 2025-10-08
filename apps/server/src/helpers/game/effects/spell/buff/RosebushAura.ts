import { spellGet } from '@lotr/content';
import { hasEffect } from '@lotr/effects';
import type { DamageArgs, ICharacter, IStatusEffect } from '@lotr/interfaces';
import { DamageClass } from '@lotr/interfaces';
import { Effect } from '../../../../../models';

export class RosebushAura extends Effect {
  public override incoming(
    effect: IStatusEffect,
    char: ICharacter,
    attacker: ICharacter | null,
    damageArgs: DamageArgs,
    currentDamage: number,
  ): number {
    if (!attacker || damageArgs.damageClass !== DamageClass.Physical) {
      return currentDamage;
    }

    if (!hasEffect(attacker, 'Venom')) {
      const spellData = spellGet('Venom', 'T:RA');
      this.game.effectHelper.addEffect(attacker, char, 'Venom', {
        effectMeta: {
          effectRef: 'Venom',
        },
        effect: {
          duration: 10,
          extra: {
            potency: this.game.spellManager.getPotency(char, char, spellData),
          },
        },
      });
    }

    return currentDamage;
  }
}
