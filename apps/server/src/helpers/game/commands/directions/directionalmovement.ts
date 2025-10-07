import { getStat } from '@lotr/characters';
import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { Direction, Stat } from '@lotr/interfaces';
import { directionFromText, directionToOffset } from '@lotr/shared';
import { MacroCommand } from '../../../../models/macro';

export class DirectionalMovement extends MacroCommand {
  override aliases = ['e', 'w', 's', 'n', 'nw', 'ne', 'sw', 'se'];
  override canBeFast = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const directionCommands = new Array<string>();
    directionCommands.push(args.calledAlias);
    if (args.stringArgs) {
      args.stringArgs
        .split(' ')
        .forEach((command) => directionCommands.push(command));
    }

    const maxMoves = getStat(player, Stat.Move);

    const directions = directionCommands
      .map((dirText) => directionFromText(dirText) ?? Direction.Center)
      .filter((dir) => dir !== Direction.Center)
      .slice(0, maxMoves);

    directions.forEach((dir) => {
      const offset = directionToOffset(dir);
      this.game.movementHelper.moveWithPathfinding(player, {
        xDiff: offset.x,
        yDiff: offset.y,
      });
    });
  }
}
