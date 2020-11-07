import { IMacroCommandArgs, IPlayer } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class Break extends MacroCommand {

  aliases = ['break'];
  canBeInstant = false;
  canBeFast = false;

  execute(player: IPlayer, args: IMacroCommandArgs) {
    const breakItem = args.stringArgs;
    if (!breakItem) {
      this.sendMessage(player, 'You need to specify which item to break!');
      return;
    }

    // TODO: retrieve item to be broken
    // TODO: check if item is owned by another player
    // TODO: check if item has a destroy effect?

    switch (breakItem) {
      case 'left':
        this.game.characterHelper.setLeftHand(player, undefined);
        this.sendMessage(player, `You break the item in your left hand!`);
        break;
      case 'right':
        this.game.characterHelper.setRightHand(player, undefined);
        this.sendMessage(player, `You break the item in your right hand!`);
        break;
      default:
      this.sendMessage(player, 'That is not one of your hands!');
      break;
    }
  }
}
