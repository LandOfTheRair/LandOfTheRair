import { ICharacter, SpellCastArgs, Stat } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class FindFamiliarShadowClones extends Spell {
  override getDuration(caster: ICharacter | null) {
    if (!caster) return 0;
    return Math.floor(
      this.game.characterHelper.getStat(caster, Stat.AGI) * 100,
    );
  }

  override cast(
    caster: ICharacter | null,
    target: ICharacter | null,
    spellCastArgs: SpellCastArgs,
  ): void {
    if (!caster || !caster.pets) return;

    caster.pets.forEach((pet) => {
      if (pet.npcId !== 'Thief Shadow Clone') return;

      Object.assign(pet.stats, caster.stats);
      Object.assign(pet.skills, caster.skills);

      pet.stats[Stat.HP] = (pet.stats[Stat.HP] ?? 100) * spellCastArgs.potency;

      pet.name = 'shadow clone';
      pet.affiliation = `${caster.name}'s Shadow Clone`;

      this.game.characterHelper.recalculateEverything(pet);
      this.game.characterHelper.healToFull(pet);
      this.game.characterHelper.manaToFull(pet);
    });
  }
}
