import type { ICharacter, SpellCastArgs } from '@lotr/interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Cleave extends Spell {
  override cast(
    caster: ICharacter | null,
    target: ICharacter | null,
    spellCastArgs: SpellCastArgs,
  ): void {
    const cleavePotency = spellCastArgs.potency;

    if (caster && target && this.game.diceRollerHelper.XInOneHundred(10)) {
      const bleedPercent = this.game.traitHelper.traitLevelValue(
        caster,
        'DeepCuts',
      );

      if (bleedPercent > 0) {
        this.game.effectHelper.addEffect(target, caster, 'Bleeding', {
          effect: {
            duration: 15,
            extra: {
              potency: Math.floor(cleavePotency * bleedPercent),
            },
          },
        });
      }
    }
  }
}
