import { Injectable } from 'injection-js';
import { clamp, isUndefined } from 'lodash';

import { BaseService, ICharacter, INPCDefinition, ObjectType, Stat } from '../../interfaces';
import { Player } from '../../models';
import { WorldManager } from '../data';
import { CharacterHelper } from './CharacterHelper';
import { DirectionHelper } from './DirectionHelper';
import { InteractionHelper } from './InteractionHelper';
import { PlayerHelper } from './PlayerHelper';

@Injectable()
export class MovementHelper extends BaseService {

  constructor(
    private worldManager: WorldManager,
    private playerHelper: PlayerHelper,
    private directionHelper: DirectionHelper,
    private characterHelper: CharacterHelper,
    private interactionHelper: InteractionHelper
  ) {
    super();
  }

  init() {}

  moveWithPathfinding(character: ICharacter, { xDiff, yDiff }): void {

    if (isUndefined(xDiff) || isUndefined(yDiff) || isNaN(xDiff) || isNaN(yDiff)) return;

    const maxMoveRate = this.characterHelper.getStat(character, Stat.Move);
    if (maxMoveRate <= 0) return;

    xDiff = clamp(xDiff, -4, 4);
    yDiff = clamp(yDiff, -4, 4);

    const { map } = this.worldManager.getMap(character.map);

    const steps = map.findPath(character.x, character.y, character.x + xDiff, character.y + yDiff);

    if (steps.length > maxMoveRate) {
      steps.length = maxMoveRate;
    }

    this.takeSequenceOfSteps(character, steps);

    if (this.characterHelper.isPlayer(character)) {
      this.playerHelper.resetStatus(character as Player);

      // TODO: handle interactable
    }
  }

  // returns true or false based on if the steps were all taken or not
  takeSequenceOfSteps(
    character: ICharacter,
    steps: Array<{ x: number, y: number }>,
    opts: { isChasing: boolean } = { isChasing: false }
  ): boolean {
    const { map, state } = this.worldManager.getMap(character.map);

    let wasSuccessfulWithNoInterruptions = true;

    const oldX = character.x;
    const oldY = character.y;

    steps.forEach(step => {
      if (!wasSuccessfulWithNoInterruptions) return;
      const nextX = character.x + step.x;
      const nextY = character.y + step.y;

      // aquatic npcs can't leave the water
      if (!this.characterHelper.isPlayer(character)) {
        const nextTileFluid = map.getFluidAt(nextX, nextY);
        if ((character as any as INPCDefinition).aquaticOnly && !nextTileFluid) return;
      }

      const nextTileWall = map.getWallAt(nextX, nextY);
      if (!nextTileWall) {
        const possibleDenseObj = map.getInteractableOrDenseObject(nextX, nextY);

        if (possibleDenseObj?.density) {

          if (possibleDenseObj.type === ObjectType.Door) {

            // if we bump into a door and can't open it: cannot move anymore
            if (!this.interactionHelper.tryToOpenDoor(character, possibleDenseObj)) {

              wasSuccessfulWithNoInterruptions = false;
              return;
            }

          // if we bump into a dense object, we cannot move anymore
          } else {
            wasSuccessfulWithNoInterruptions = false;
            return;

          }
        }

      // if we run into a wall: nope, no more movement
      } else {
        wasSuccessfulWithNoInterruptions = false;
        return;
      }

      if (!opts.isChasing && !this.isValidStep(character, nextX, nextY)) return;

      character.x = nextX;
      character.y = nextY;
    });

    if (character.x < 0) character.x = 0;
    if (character.x > map.width) character.x = map.width;
    if (character.y < 0) character.y = 0;
    if (character.y > map.height) character.y = map.height;

    // TODO: handle event sources
    // TODO: trigger traps
    this.directionHelper.setDirBasedOnXYDiff(character, character.x - oldX, character.y - oldY);

    state.moveNPCOrPlayer(character, { oldX, oldY });

    return wasSuccessfulWithNoInterruptions;
  }

  isValidStep(character: ICharacter, x: number, y: number): boolean {
    if (this.characterHelper.isPlayer(character)) return true;

    // TODO: spawner/path logic
    return false;
  }
}
