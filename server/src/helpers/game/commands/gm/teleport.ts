import { IMacroCommandArgs, IPlayer } from '../../../../interfaces';
import { Player } from '../../../../models';
import { MacroCommand } from '../../../../models/macro';

export class GMTeleport extends MacroCommand {

  override aliases = ['@teleport', '@t'];
  override isGMCommand = true;
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {

    const [x, y, map] = args.arrayArgs;
    if (!x || !y) {
      this.sendMessage(player, 'Syntax: X Y [Map]');
      return;
    }

    this.sendMessage(player, 'Woosh.');
    this.game.teleportHelper.teleport(player as Player, { x: +x, y: +y, map });
  }
}
