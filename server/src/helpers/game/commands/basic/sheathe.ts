
import { capitalize } from 'lodash';

import { ICharacter, IMacroCommandArgs } from '../../../../interfaces';
import { Player } from '../../../../models';
import { MacroCommand } from '../../../../models/macro';

export class Sheathe extends MacroCommand {

  override aliases = ['sheathe'];
  override canBeInstant = false;
  override canBeFast = true;

  override execute(char: ICharacter, args: IMacroCommandArgs) {
    const hand = args.stringArgs;

    if (hand !== 'left' && hand !== 'right') return this.sendMessage(char, 'Invalid hand for sheathing from.');

    this.game.commandHandler.doCommand(char as Player, { command: `~${capitalize(hand).substring(0, 1)}tB` }, args.callbacks);
  }
}
