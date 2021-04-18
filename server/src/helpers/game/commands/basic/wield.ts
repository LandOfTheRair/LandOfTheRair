
import { ICharacter, IMacroCommandArgs, ItemSlot } from '../../../../interfaces';
import { Player } from '../../../../models';
import { MacroCommand } from '../../../../models/macro';

export class Wield extends MacroCommand {

  override aliases = ['wield'];
  override canBeInstant = false;
  override canBeFast = true;

  override execute(char: ICharacter, args: IMacroCommandArgs) {
    let slot = +args.stringArgs;

    if (isNaN(slot)) {
      slot = -1;

      char.items.belt.items.forEach((beltItem, idx) => {
        const { itemClass, type, name } = this.game.itemHelper.getItemProperties(beltItem, ['itemClass', 'type', 'name']);

        if (itemClass?.toLowerCase() === args.stringArgs.toLowerCase()
        || type?.toLowerCase() === args.stringArgs.toLowerCase()
        || name?.toLowerCase().includes(args.stringArgs.toLowerCase())) {
          slot = idx;
        }
      });
    }

    if (slot < 0) return this.sendMessage(char, 'Could not find an item to wield.');

    if (!char.items.equipment[ItemSlot.RightHand]) {
      this.game.commandHandler.doCommand(char as Player, { command: '~BtR', args: `${slot}` }, args.callbacks);
    } else {
      this.game.commandHandler.doCommand(char as Player, { command: '~BtL', args: `${slot}` }, args.callbacks);
    }
  }
}
