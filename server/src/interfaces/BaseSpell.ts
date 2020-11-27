import { ICharacter, ISpellData } from '../../../shared/interfaces';

export interface BaseSpell {

  getDuration(caster: ICharacter | null, target: ICharacter | null, spellData: ISpellData): number;
  getPotency(caster: ICharacter | null, target: ICharacter | null, spellData: ISpellData): number;
  cast(caster: ICharacter | null, target: ICharacter | null, spellCastArgs: SpellCastArgs): void;

}

export interface SpellCastArgs {
  potency: number;
  duration: number;
  range: number;
  spellData: ISpellData;
  callbacks: any;
}
