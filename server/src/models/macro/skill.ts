import { ICharacter, IMacroSkill } from '../../interfaces';
import { MacroCommand } from './command';

export class MacroSkill extends MacroCommand implements IMacroSkill {

  override aliases = [];

  targetsFriendly = false;
  override requiresLearn = false;

  range(char: ICharacter) {
    return 0;
  }

  cost(char: ICharacter) {
    return 0;
  }

  modifyCost(char: ICharacter, cost: number) {
    return cost;
  }

  canUse(char: ICharacter, target: ICharacter) {
    return true;
  }

  override use(char: ICharacter, target: ICharacter, opts?: any) {}

}
