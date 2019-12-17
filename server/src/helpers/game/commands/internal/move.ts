import { MacroCommand } from '../../../../models/macro';

export class Move extends MacroCommand {
  aliases = ['move'];
  canBeFast = true;
}
