import { getStat, healToFull, manaToFull } from '@lotr/characters';
import type { ICharacter, SpellCastArgs } from '@lotr/interfaces';
import { Stat } from '@lotr/interfaces';
import { Spell } from '../../../../models/world/Spell';

export class FindFamiliarDistraction extends Spell {
  override getDuration(caster: ICharacter | null) {
    if (!caster) return 0;
    return Math.floor(getStat(caster, Stat.AGI) * 5);
  }

  override cast(
    caster: ICharacter | null,
    target: ICharacter | null,
    spellCastArgs: SpellCastArgs,
  ): void {
    if (!caster || !caster.pets) return;

    caster.pets.forEach((pet) => {
      if (pet.npcId !== 'Thief Distraction') return;

      // only one distraction pet per person at a time
      if (pet.name === 'dancing shadow') {
        pet.hp.current = 0;
        caster.pets = (caster.pets || []).filter((x) => x !== pet);
        return;
      }

      pet.stats[Stat.Move] = 0;
      pet.stats[Stat.HP] = (pet.stats[Stat.HP] ?? 100) * spellCastArgs.potency;

      pet.name = 'dancing shadow';
      pet.affiliation = `${caster.name}'s Distraction`;

      this.game.characterHelper.recalculateEverything(pet);
      healToFull(pet);
      manaToFull(pet);
    });
  }
}
