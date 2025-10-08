import type { ICharacter, SpellCastArgs } from '@lotr/interfaces';
import { Spell } from '../../../../models/world/Spell';

export class EnergyWave extends Spell {
  override cast(
    caster: ICharacter | undefined,
    target: ICharacter | undefined,
    spellCastArgs: SpellCastArgs,
  ): void {
    if (!target) return;

    this.game.spellManager.castSpell('Push', undefined, target);
  }
}
