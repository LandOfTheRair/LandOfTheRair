import { IMacroCommandArgs, IPlayer, ItemSlot } from '../../../../interfaces';
import { Player } from '../../../../models';
import { MacroCommand } from '../../../../models/macro';

export class GMTeleport extends MacroCommand {

  aliases = ['@teleport'];
  isGMCommand = true;
  canBeInstant = false;
  canBeFast = false;

  execute(player: IPlayer, args: IMacroCommandArgs) {

    const [x, y, map] = args.arrayArgs;
    if (!x || !y) {
      this.sendMessage(player, 'Syntax: X Y [Map]');
      return;
    }

    this.game.teleportHelper.teleport(player as Player, { x: +x, y: +y, map });
    this.sendMessage(player, 'Woosh.');
  }
}
