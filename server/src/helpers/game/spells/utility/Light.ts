

import { ICharacter, SpellCastArgs } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Light extends Spell {

  override cast(caster: ICharacter | null, target: ICharacter | null, spellCastArgs: SpellCastArgs): void {
    if (!target) return;

    const basePotency = spellCastArgs.potency ?? 10;
    const duration = basePotency * 1500;

    if (caster) {
      this.sendMessage(caster, { message: 'You cast away the darkness.' });
    }

    this.game.darknessHelper.removeDarkness(target.map, target.x, target.y, spellCastArgs.range, Date.now() + duration);
  }

}
