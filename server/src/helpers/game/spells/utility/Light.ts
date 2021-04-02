

import { ICharacter, SpellCastArgs } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Light extends Spell {

  cast(caster: ICharacter | null, target: ICharacter | null, spellCastArgs: SpellCastArgs): void {
    if (!caster || !target) return;

    const basePotency = spellCastArgs.potency ?? 10;
    const duration = basePotency * 1000;

    this.sendMessage(caster, { message: 'You cast away the darkness.' });
    this.game.darknessHelper.removeDarkness(caster.map, target.x, target.y, 1, Date.now() + duration);
  }

}
