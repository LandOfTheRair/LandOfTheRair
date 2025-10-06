import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { directionFromText, directionToOffset } from '@lotr/shared';
import { MacroCommand } from '../../../../../models/macro';

export class Door extends MacroCommand {
  override aliases = ['open', 'close'];
  override canBeFast = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!args.stringArgs) return;

    let offset = { x: 0, y: 0 };
    const dir = directionFromText(args.stringArgs);
    if (dir) {
      offset = directionToOffset(dir);
    } else {
      [offset.x, offset.y] = args.arrayArgs.map((z) => +z);
    }

    const door = this.game.worldManager
      .getMap(player.map)
      ?.map.getInteractableAt(player.x + offset.x, player.y + offset.y);
    if (!door) {
      return this.sendMessage(player, 'There is no door there.');
    }

    this.game.interactionHelper.tryToOpenDoor(player, door);
  }
}
