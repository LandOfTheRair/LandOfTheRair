import { IMacroCommandArgs, IPlayer, MessageType } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class Break extends MacroCommand {

  aliases = ['break'];
  canBeInstant = false;
  canBeFast = false;

  execute(player: IPlayer, args: IMacroCommandArgs) {
    let message;
    const breakItem = args.stringArgs;
    if (!breakItem) {
      message = 'You need to specify which item to break!';
      this.game.messageHelper.sendLogMessageToPlayer(player, { message, sfx: undefined }, [MessageType.Description]);
      return;
    }

    // TODO: retrieve item to be broken
    // TODO: check if item is owned by another player
    // TODO: check if item has a destroy effect?

    switch (breakItem) {
      case 'left':
        this.game.characterHelper.setLeftHand(player, undefined);
        message = `You break the item in your left hand!`;
        break;
      case 'right':
        this.game.characterHelper.setRightHand(player, undefined);
        message = `You break the item in your right hand!`;
        break;
      default:
        message = 'That is not one of your hands!';
        break;
    }
    this.game.messageHelper.sendLogMessageToPlayer(player, { message, sfx: undefined }, [MessageType.Description]);
  }
}
