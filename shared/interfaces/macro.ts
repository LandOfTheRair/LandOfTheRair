import { ICharacter } from './character';
import { IGame } from './game';
import { IPlayer } from './player';

export interface IMacroCommandArgs {
  game: IGame;

  emit: (id, args) => void;
}

export interface IMacroCommand {
  name: string[];
  canBeFast: boolean;

  execute(executor: IPlayer, args: IMacroCommandArgs): void;
}

export interface IMacroSkill extends IMacroCommand {
  metadata: IMacroMetadata;
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

export interface IMacro {
  key: string;
  modifiers: { shift: boolean, alt: boolean, ctrl: boolean };

  autoActivate: boolean;
  lockActivation: boolean;
  clickToTarget: boolean;
  ignoreAutoattackOption: boolean;

  appendTargetToEachMacro: boolean;
  macro: string;

  tooltipDesc: string;

  name: string;
  icon: string;

  foreground: string;
  background: string;

  isSystem: boolean;
  requiresLearn: boolean;
  requiresBaseClass: boolean;
}

export interface IMacroMetadata {
  name: string;
  macro: string;

  icon: string;
  color: string;
  bgColor?: string;

  mode: 'autoActivate' | 'lockActivation' | 'clickToTarget';
  tooltipDesc: string;

  requireBaseClass?: string;
  requireCharacterLevel?: number;
  requireSkillLevel?: number;

  skillTPCost?: number;
}
