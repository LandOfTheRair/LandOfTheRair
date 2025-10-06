import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { MessageType } from '@lotr/interfaces';
import { MacroCommand } from '../../../../models/macro';

export class DebugCountItems extends MacroCommand {
  override aliases = ['&items'];
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const mapItemCount = this.game.groundManager.getAllItemsFromGround(
      player.map,
    ).length;
    const message = `[Debug] There are currently ${mapItemCount} items on the ground in this world.`;
    this.game.messageHelper.sendLogMessageToPlayer(
      player,
      { message, sfx: undefined },
      [MessageType.Description],
    );
  }
}
