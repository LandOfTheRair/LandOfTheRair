

import { ICharacter, SpellCastArgs } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Darkness extends Spell {

  override cast(caster: ICharacter | null, target: ICharacter | null, spellCastArgs: SpellCastArgs): void {
    if (!caster || !target) return;

    const basePotency = spellCastArgs.potency ?? 10;
    const duration = basePotency * 1000;

    this.sendMessage(caster, { message: 'You cloak the area in a veil of darkness.' });

    const radius = spellCastArgs.range + (caster ? this.game.traitHelper.traitLevelValue(caster, 'DarknessWiden') : 0);
    this.game.darknessHelper.createDarkness(caster.map, target.x, target.y, radius, Date.now() + duration);
  }

}
