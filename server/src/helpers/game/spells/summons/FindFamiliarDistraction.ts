
import { ICharacter, Skill, SpellCastArgs, Stat } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class FindFamiliarDistraction extends Spell {

  override getDuration(caster: ICharacter | null) {
    if (!caster) return 0;
    return Math.floor(this.game.characterHelper.getStat(caster, Stat.AGI) * 5);
  }

  override getPotency(caster: ICharacter | null) {
    return caster ? this.game.characterHelper.getSkillLevel(caster, Skill.Thievery) : 10;
  }

  override cast(caster: ICharacter | null, target: ICharacter | null, spellCastArgs: SpellCastArgs): void {
    if (!caster || !caster.pets) return;

    caster.pets.forEach(pet => {
      if (pet.npcId !== 'Thief Distraction') return;

      pet.stats[Stat.Move] = 0;
      pet.stats[Stat.HP] = (pet.stats[Stat.HP] ?? 100) * spellCastArgs.potency;

      pet.name = 'dancing shadow';
      pet.affiliation = `${caster.name}'s Distraction`;

      this.game.characterHelper.recalculateEverything(pet);
      this.game.characterHelper.healToFull(pet);
      this.game.characterHelper.manaToFull(pet);
    });

  }

}
