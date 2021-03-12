import { ICharacter } from './character';
import { IItemEffect } from './effect';
import { IPlayer } from './player';

export interface IMacroCommandArgs {
  stringArgs: string;
  arrayArgs: string[];
  objArgs: any;
  overrideEffect?: IItemEffect;
  calledAlias: string;
  spell?: string;
  callbacks: {
    broadcast: (args) => void,
    emit: (args) => void
  };
}

export interface IMacroCommand {
  aliases: string[];
  canBeFast: boolean;
  canBeInstant: boolean;

  execute(executor: IPlayer, args: IMacroCommandArgs): void;
}

export interface IMacroSkill extends IMacroCommand {
  targetsFriendly: boolean;
  requiresLearn: boolean;

  range(char: ICharacter): number;
  cost(char: ICharacter): number;
  modifyCost(char: ICharacter, cost: number): number;
  canUse(char: ICharacter, target: ICharacter): boolean;

  use(char: ICharacter, target: ICharacter, opts: any): void;
}

export interface IMacroMonsterSkill extends IMacroSkill {
  isMonsterSkill: boolean;
}

export interface IMacroContainer {
  activeMacroBars: Record<string, Record<number, string[]>>;                    // username -> charSlot -> [group1, group2, group3]
  activeMacros: Record<string, Record<number, string>>;                         // username -> charSlot -> macroname
  customMacros: Record<string, IMacro>;
  learnedMacros: Record<string, Record<number, Record<string, IMacro>>>;        // username -> charSlot -> macroname -> macro
  characterMacros: Record<string, Record<number, Record<string, IMacroBar>>>;   // username -> charSlot -> macrobarname -> macrobar
}

export interface IMacroBar {
  macros: string[];
  name: string;
}

export interface IMacro {
  key?: string;
  modifiers?: { shift: boolean, alt: boolean, ctrl: boolean };

  mode: string; // 'autoActivate' | 'lockActivation' | 'clickToTarget' | 'autoTarget';

  appendTargetToEachMacro?: boolean;
  macro: string;

  tooltipDesc: string;

  name: string;
  icon: string;
  for?: string;

  color: string;
  bgColor?: string;

  ignoreAutoAttack?: boolean;

  isDefault?: boolean;
  isSystem?: boolean;
  requiresLearn?: boolean;
  requireBaseClass?: string;
  requireCharacterLevel?: number;
  requireSkillLevel?: number;

  createdCharSlot?: number;
}

