import { Direction, IMacroCommandArgs, IPlayer } from '../../../../../interfaces';
import { MacroCommand } from '../../../../../models/macro';

export class Door extends MacroCommand {

  override aliases = ['open', 'close'];
  override canBeFast = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!args.stringArgs) return;

    let { x, y } = this.game.directionHelper.getXYFromDir(args.stringArgs as Direction);

    if (args.stringArgs.includes(' ')) {
      [x, y] = args.arrayArgs.map(z => +z);
    }

    const door = this.game.worldManager.getMap(player.map)?.map.getInteractableAt(player.x + x, player.y + y);
    if (!door) {
      return this.sendMessage(player, 'There is no door there.');
    }

    this.game.interactionHelper.tryToOpenDoor(player, door);
  }

}
