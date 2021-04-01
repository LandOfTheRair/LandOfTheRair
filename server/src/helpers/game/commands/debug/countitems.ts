import { IMacroCommandArgs, IPlayer, MessageType } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class DebugCountItems extends MacroCommand {

  aliases = ['&items'];
  canBeInstant = false;
  canBeFast = false;

  execute(player: IPlayer, args: IMacroCommandArgs) {
    const message = `[Debug] There are currently ${this.game.groundManager.getItemsFromGround.length} items on the ground in this world.`;
    this.game.messageHelper.sendLogMessageToPlayer(player, { message, sfx: undefined }, [MessageType.Description]);
  }
}
