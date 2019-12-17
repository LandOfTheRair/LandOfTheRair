import { MacroCommand } from '../../../../models/macro';

export class Move extends MacroCommand {
  name = ['move'];
  canBeFast = true;
}
