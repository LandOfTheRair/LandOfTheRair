import { ICharacter } from './character';
import { IItemEffect } from './effect';
import { IMacroCommandArgs } from './macro';
import { ISpellData } from './spell';
import { IStatusEffectData } from './status-effect';
import { DeepPartial } from './typescript';

export interface BaseSpell {
  getDuration(
    caster: ICharacter | null,
    target: ICharacter | null,
    spellData: ISpellData,
  ): number;
  getOverrideEffectInfo(
    caster: ICharacter | null,
    target: ICharacter | null,
    spellData: ISpellData,
    override: Partial<IItemEffect>,
  ): DeepPartial<IStatusEffectData>;
  getPotency(
    caster: ICharacter | null,
    target: ICharacter | null,
    spellData: ISpellData,
  ): number;
  cast(
    caster: ICharacter | null,
    target: ICharacter | null,
    spellCastArgs: SpellCastArgs,
  ): void;
}

export interface SpellCastArgs {
  potency: number;
  duration: number;
  range: number;
  spellData: ISpellData;
  callbacks?: { emit };
  originalArgs?: Partial<IMacroCommandArgs>;
  x?: number;
  y?: number;
  map?: string;
}
