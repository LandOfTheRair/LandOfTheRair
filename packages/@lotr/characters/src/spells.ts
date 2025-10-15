import {
  itemCanGetBenefitsFrom,
  itemPropertiesGet,
  traitGet,
} from '@lotr/content';
import type { ICharacter, IPlayer, ItemSlot } from '@lotr/interfaces';
import { LearnedSpell } from '@lotr/interfaces';
import { isPlayer } from './player';

// recalculate what spells we know based on traits and items
export function recalculateLearnedSpells(character: ICharacter): void {
  const fromFate = Object.keys(character.learnedSpells).filter(
    (x) => character.learnedSpells[x] === LearnedSpell.FromFate,
  );

  character.learnedSpells = {};

  const learnSpell = (spell: string, learnFrom: LearnedSpell) => {
    const curLearnedStatus = character.learnedSpells[spell.toLowerCase()];
    if (curLearnedStatus === LearnedSpell.FromTraits) return;

    character.learnedSpells[spell.toLowerCase()] = learnFrom;
  };

  // check all traits for spells
  Object.keys(character.allTraits ?? {}).forEach((trait) => {
    const traitRef = traitGet(trait, `RLS:${character.name}`);
    if (!traitRef || !traitRef.spellGiven) return;

    learnSpell(traitRef.spellGiven, LearnedSpell.FromTraits);
  });

  // check all items
  Object.keys(character.items.equipment).forEach((itemSlot) => {
    const item = character.items.equipment[itemSlot as ItemSlot];
    if (!item) return;

    // no spells if we can't technically use the item
    if (
      isPlayer(character) &&
      !itemCanGetBenefitsFrom(character as IPlayer, item)
    ) {
      return;
    }

    // check if it has an effect, and if we can use that effect
    const { useEffect } = itemPropertiesGet(item, ['useEffect']);

    if (useEffect && useEffect.uses) {
      learnSpell(useEffect.name, LearnedSpell.FromItem);
    }
  });

  // re-learn fated spells last
  fromFate.forEach((spell) => learnSpell(spell, LearnedSpell.FromFate));
}
