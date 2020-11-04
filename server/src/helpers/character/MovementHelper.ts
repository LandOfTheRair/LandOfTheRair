import { Injectable } from 'injection-js';
import { clamp, isUndefined } from 'lodash';

import { BaseService, DamageClass, ICharacter, INPC, ObjectType, Stat } from '../../interfaces';
import { Player } from '../../models';
import { WorldManager } from '../data';
import { CharacterHelper } from './CharacterHelper';
import { CombatHelper } from './CombatHelper';
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
    private interactionHelper: InteractionHelper,
    private combatHelper: CombatHelper
  ) {
    super();
  }

  init() {}

  moveWithPathfinding(character: ICharacter, { xDiff, yDiff }): boolean {

    if (isUndefined(xDiff) || isUndefined(yDiff) || isNaN(xDiff) || isNaN(yDiff)) return false;

    const maxMoveRate = this.characterHelper.getStat(character, Stat.Move);
    if (maxMoveRate <= 0) return false;

    xDiff = clamp(xDiff, -4, 4);
    yDiff = clamp(yDiff, -4, 4);

    const { map } = this.worldManager.getMap(character.map);

    const steps = map.findPath(character.x, character.y, character.x + xDiff, character.y + yDiff);

    if (steps.length > maxMoveRate) {
      steps.length = maxMoveRate;
    }

    const didFinish = this.takeSequenceOfSteps(character, steps);

    if (this.characterHelper.isPlayer(character)) {
      this.playerHelper.resetStatus(character as Player);

      const mapData = this.game.worldManager.getMap(character.map);
      const interactable = mapData.map.getInteractableAt(character.x, character.y);

      if (interactable) {
        this.handleInteractable(character as Player, interactable);
      }
    }

    return didFinish;
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
        if ((character as any as INPC).aquaticOnly && !nextTileFluid) return;
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

  private handleInteractable(player: Player, obj): void {
    switch (obj.type) {
      case 'Fall':     return this.handleTeleport(player, obj, true);
      case 'Teleport': return this.handleTeleport(player, obj);

      // TODO: lockers
      // case 'Locker':   return this.handleLocker(player, obj);
    }
  }

  private handleTeleport(player: Player, obj, isFall = false): void {
    const {
      teleportX, teleportY, teleportMap,
      requireHeld, requireParty, requireHoliday,
      // requireQuest, requireQuestProgress, requireQuestComplete,
      damagePercent
    } = obj.properties;

    if (requireParty && !player.partyName) {
      this.game.messageHelper.sendLogMessageToPlayer(player, { message: 'You must gather your party before venturing forth.' });
      return;
    }

    if (requireHoliday && !this.game.holidayHelper.isHoliday(requireHoliday)) {
      this.game.messageHelper.sendLogMessageToPlayer(player, {
        message: `That location is only seasonally open during "${requireHoliday}"!` });
      return;
    }

    // check if player has a held item
    if (requireHeld
    && !this.characterHelper.hasHeldItem(player, requireHeld, 'left')
    && !this.characterHelper.hasHeldItem(player, requireHeld, 'right')) return;

    // check if player has a quest (and the corresponding quest progress, if necessary)
    /* TODO: quests
    if(requireQuest) {

      // if the player has permanent completion for it, they can always get through
      if(!player.hasPermanentCompletionFor(requireQuest)) {

        // but if not, we check if we need a certain quest progress
        if(requireQuestProgress) {
          const questData = player.getQuestData({ name: requireQuest });
          if(!questData || !questData[requireQuestProgress]) return;
        }

        // then we check if they have the quest
        if(!player.hasQuest({ name: requireQuest })) return;
      }
    }

    // check if player has completed quest
    if(requireQuestComplete) {
      if(!player.hasPermanentCompletionFor(requireQuestComplete)) return;
    }
    */

    this.game.teleportHelper.teleport(player, { x: teleportX, y: teleportY, map: teleportMap });

    if (isFall) {
      const hpLost = Math.floor(player.hp.maximum * ((damagePercent || 15) / 100));

      // TODO: fleetoffoot does 1 damage if you fall
      const damage = hpLost;
      this.combatHelper.dealOnesidedDamage(player, {
        damage,
        damageClass: DamageClass.Physical,
        damageMessage: 'You have fallen!',
        suppressIfNegative: true,
        overrideSfx: 'combat-hit-melee'
      });
    } else {
      this.game.messageHelper.sendLogMessageToPlayer(player, { message: 'Your surroundings shift.' });
    }
  }
}
