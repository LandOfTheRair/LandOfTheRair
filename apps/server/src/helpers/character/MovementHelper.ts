import { Injectable } from 'injection-js';
import { clamp, isUndefined, random } from 'lodash';

import { hasEffect } from '@lotr/effects';
import type { ICharacter, INPC } from '@lotr/interfaces';
import {
  DamageClass,
  ObjectType,
  SoundEffect,
  Stat,
  TrackedStatistic,
} from '@lotr/interfaces';
import type { Player } from '../../models';
import { BaseService } from '../../models/BaseService';

import { addStatistic, getStat, hasHeldItem, isPlayer } from '@lotr/characters';
import { isHoliday, settingGameGet, traitLevel } from '@lotr/content';
import {
  transmissionMovementPatchSend,
  worldGetMapAndState,
  worldMapStateGetForCharacter,
} from '@lotr/core';
import type { IMovementHelper } from '@lotr/interfaces';
import { isAtLeastTester, isPlayerSubscribed } from '@lotr/premium';
import { directionDiagonalToWestEast, directionFromOffset } from '@lotr/shared';

@Injectable()
export class MovementHelper extends BaseService implements IMovementHelper {
  private maxMove = 4;

  init() {
    this.maxMove = settingGameGet('character', 'maxMove') ?? 4;
  }

  faceTowards(source: ICharacter, target: { x: number; y: number }) {
    const xDiff = target.x - source.x;
    const yDiff = target.y - source.y;
    if (xDiff === 0 && yDiff === 0) return;
    const direction = directionFromOffset(xDiff, yDiff);
    source.dir = directionDiagonalToWestEast(direction);
  }

  moveTowards(source: ICharacter, target: { x: number; y: number }): boolean {
    const xDiff = target.x - source.x;
    const yDiff = target.y - source.y;

    return this.game.movementHelper.moveWithPathfinding(source, {
      xDiff,
      yDiff,
    });
  }

  numStepsTo(
    source: { x: number; y: number; map: string },
    target: { x: number; y: number },
  ): number {
    const xDiff = target.x - source.x;
    const yDiff = target.y - source.y;

    const map = worldGetMapAndState(source.map)?.map;
    if (!map) return 0;

    const steps =
      map.findPathExcludingWalls(
        source.x,
        source.y,
        source.x + xDiff,
        source.y + yDiff,
      ) ?? [];

    return steps.length;
  }

  moveWithPathfinding(character: ICharacter, { xDiff, yDiff }): boolean {
    if (
      isUndefined(xDiff) ||
      isUndefined(yDiff) ||
      isNaN(xDiff) ||
      isNaN(yDiff)
    ) {
      return false;
    }

    const maxMoveRate = getStat(character, Stat.Move);
    if (maxMoveRate <= 0) return false;

    xDiff = clamp(xDiff, -this.maxMove, this.maxMove);
    yDiff = clamp(yDiff, -this.maxMove, this.maxMove);

    const map = worldGetMapAndState(character.map)?.map;
    if (!map) return false;

    const steps =
      map.findPath(
        character.x,
        character.y,
        character.x + xDiff,
        character.y + yDiff,
      ) ?? [];

    if (steps.length > maxMoveRate) {
      steps.length = maxMoveRate;
    }

    const didFinish = this.takeSequenceOfSteps(character, steps);

    if (isPlayer(character)) {
      addStatistic(character as Player, TrackedStatistic.Steps, steps.length);
    }

    return didFinish;
  }

  moveRandomly(character: ICharacter, numSteps: number): void {
    const steps = Array(numSteps)
      .fill(null)
      .map(() => ({ x: random(-1, 1), y: random(-1, 1) }));
    if (steps.length === 0) return;

    this.takeSequenceOfSteps(character, steps);
  }

  // returns true or false based on if the steps were all taken or not
  takeSequenceOfSteps(
    character: ICharacter,
    steps: Array<{ x: number; y: number }>,
    opts: { isChasing: boolean } = { isChasing: false },
  ): boolean {
    const mapData = worldGetMapAndState(character.map);
    if (!mapData.map || !mapData.state) return false;

    const { map, state } = mapData;

    let wasSuccessfulWithNoInterruptions = true;

    const oldX = character.x;
    const oldY = character.y;

    steps.forEach((step) => {
      if (!wasSuccessfulWithNoInterruptions) return;
      const nextX = clamp(character.x + step.x, 0, map.width);
      const nextY = clamp(character.y + step.y, 0, map.height);

      if (character.x === nextX && character.y === nextY) {
        wasSuccessfulWithNoInterruptions = false;
        return;
      }

      const oldEventSource = map.getInteractableOfTypeAt(
        character.x,
        character.y,
        ObjectType.EventSource,
      );
      const newEventSource = map.getInteractableOfTypeAt(
        nextX,
        nextY,
        ObjectType.EventSource,
      );

      // aquatic npcs can't leave the water
      if (!isPlayer(character)) {
        const nextTileFluid = map.getFluidAt(nextX, nextY);
        if ((character as INPC).aquaticOnly && !nextTileFluid) {
          wasSuccessfulWithNoInterruptions = false;
          return;
        }
      }

      const nextTileWall = map.getWallAt(nextX, nextY);
      const canWallWalk = hasEffect(character, 'WallWalk');
      if (!nextTileWall || canWallWalk) {
        const possibleDenseObj = map.getInteractableOrDenseObject(nextX, nextY);

        if (possibleDenseObj?.density) {
          if (possibleDenseObj.type === ObjectType.Door) {
            // if we bump into a door and can't open it: cannot move anymore
            if (
              !this.game.interactionHelper.tryToOpenDoor(
                character,
                possibleDenseObj,
              )
            ) {
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

      this.faceTowards(character, { x: nextX, y: nextY });
      character.x = nextX;
      character.y = nextY;

      // handle step events
      if (oldEventSource && oldEventSource.properties.offEvent) {
        worldMapStateGetForCharacter(character)?.handleEvent(
          oldEventSource.properties.offEvent,
          character,
        );
      }

      if (newEventSource && newEventSource.properties.onEvent) {
        worldMapStateGetForCharacter(character)?.handleEvent(
          newEventSource.properties.onEvent,
          character,
        );
      }
    });

    if (isPlayer(character)) {
      this.game.playerHelper.resetStatus(character as Player, {
        sendFOV: false,
      });
      transmissionMovementPatchSend(character as Player);

      const interactable = mapData?.map.getInteractableAt(
        character.x,
        character.y,
      );

      if (interactable) {
        this.handleInteractable(character as Player, interactable);
      }
    }

    const trap = this.game.trapHelper.getTrapAt(
      character.map,
      character.x,
      character.y,
    );
    if (trap && !traitLevel(character, 'GentleStep')) {
      this.game.trapHelper.triggerTrap(character, trap);
    }

    state.moveNPCOrPlayer(character, { oldX, oldY });

    return wasSuccessfulWithNoInterruptions;
  }

  private handleInteractable(player: Player, obj): void {
    switch (obj.type) {
      case 'Fall':
        return this.handleTeleport(player, obj, true);
      case 'Teleport':
        return this.handleTeleport(player, obj);
      case 'Locker':
        return this.handleLocker(player, obj.name);
    }
  }

  public postTeleportInteractableActions(player: Player, obj): void {
    const { teleportMessage } = obj.properties;

    if (teleportMessage) {
      this.game.messageHelper.sendLogMessageToPlayer(player, {
        message: teleportMessage,
      });
    }
  }

  public canUseTeleportInteractable(player: Player, obj): boolean {
    const {
      requireHeld,
      requireParty,
      requireHoliday,
      requireQuest,
      requireQuestProgress,
      requireQuestComplete,
      requireWorldInit,
      requireClass,
      requireTester,
      subscriberOnly,
      teleportMap,
    } = obj.properties;

    if (requireTester && !isAtLeastTester(player)) {
      this.game.messageHelper.sendLogMessageToPlayer(player, {
        message: 'This area is under construction!',
      });
      return false;
    }

    if (subscriberOnly && isPlayerSubscribed(player)) {
      this.game.messageHelper.sendLogMessageToPlayer(player, {
        message: "You found an easter egg! Sadly, it's spoiled.",
      });
      return false;
    }

    if (requireParty && !this.game.partyHelper.isInParty(player)) {
      this.game.messageHelper.sendLogMessageToPlayer(player, {
        message: 'You must gather your party before venturing forth.',
      });
      return false;
    }

    if (
      requireWorldInit &&
      !this.game.worldManager.shouldAllowNewSpawnersToBeInitializedFromDungeons
    ) {
      this.game.messageHelper.sendLogMessageToPlayer(player, {
        message: `The ether is not yet ready to receive you! (${this.game.worldManager.loadPercentage})`,
      });
      return false;
    }

    if (requireHoliday && !isHoliday(requireHoliday)) {
      this.game.messageHelper.sendLogMessageToPlayer(player, {
        message: `That location is only seasonally open during "${requireHoliday}"!`,
      });
      return false;
    }

    if (
      teleportMap &&
      !this.game.teleportHelper.canEnterMap(player, teleportMap)
    ) {
      this.game.messageHelper.sendLogMessageToPlayer(player, {
        message: 'You cannot enter this area!',
      });
      return false;
    }

    // check if player has a held item
    if (
      requireHeld &&
      !hasHeldItem(player, requireHeld, 'left') &&
      !hasHeldItem(player, requireHeld, 'right')
    ) {
      return false;
    }

    // check if player has a quest (and the corresponding quest progress, if necessary)
    if (requireQuest) {
      // if the player has permanent completion for it, they can always get through
      if (
        !this.game.questHelper.isQuestPermanentlyComplete(player, requireQuest)
      ) {
        // but if not, we check if we need a certain quest progress
        if (requireQuestProgress) {
          const questData = this.game.questHelper.getQuestProgress(
            player,
            requireQuest,
          );
          if (!questData || !questData[requireQuestProgress]) return false;
        }

        // then we check if they have the quest
        if (!this.game.questHelper.hasQuest(player, requireQuest)) return false;
      }
    }

    // check if player has completed quest
    if (requireQuestComplete) {
      if (
        !this.game.questHelper.isQuestPermanentlyComplete(
          player,
          requireQuestComplete,
        )
      ) {
        return false;
      }
    }

    if (requireClass && player.baseClass !== requireClass) {
      this.game.messageHelper.sendLogMessageToPlayer(player, {
        message: "You can't quite figure out how to navigate this.",
      });

      return false;
    }

    return true;
  }

  public getDestinationForTeleportInteractable(
    player: Player,
    obj,
  ): undefined | { x: number; y: number; map: string } {
    const { teleportX, teleportY, teleportMap, teleportTagMap, teleportTag } =
      obj.properties;

    if (teleportTag && teleportTagMap) {
      const mapData = worldGetMapAndState(teleportTagMap);
      const tagData = mapData?.map?.getTeleportTagRef(teleportTag);
      if (!tagData) {
        return undefined;
      }

      return { x: tagData.x, y: tagData.y, map: teleportTagMap };
    } else if (teleportX && teleportY && teleportMap) {
      return {
        x: teleportX,
        y: teleportY,
        map: teleportMap,
      };
    } else if (teleportX && teleportY) {
      return {
        x: teleportX,
        y: teleportY,
        map: player.map,
      };
    }

    return undefined;
  }

  private handleTeleport(player: Player, obj, isFall = false): void {
    if (!obj.properties) return;

    const { teleportMessage, damagePercent, applyEffect, giveAchievement } =
      obj.properties;

    if (!this.canUseTeleportInteractable(player, obj)) return;

    let didTeleport = false;

    const teleportDestination = this.getDestinationForTeleportInteractable(
      player,
      obj,
    );
    if (!teleportDestination) {
      this.game.messageHelper.sendLogMessageToPlayer(player, {
        message:
          'It seems this portal is active, but the connection is severed.',
      });
      return;
    }

    didTeleport = this.game.teleportHelper.teleport(player, {
      x: teleportDestination.x,
      y: teleportDestination.y,
      map: teleportDestination.map,
    });

    if (!didTeleport) return;

    if (applyEffect) {
      this.game.effectHelper.addEffect(player, '', applyEffect);
    }

    if (isFall) {
      const fallDamagePercent =
        settingGameGet('character', 'fallDamagePercent') ?? 15;
      let hpLost = Math.floor(
        player.hp.maximum * ((damagePercent || fallDamagePercent) / 100),
      );

      // Fleet Of Foot reduces fall damage to 1
      if (hasEffect(player, 'FleetOfFoot')) {
        hpLost = 1;
      }

      const damage = hpLost;
      this.game.combatHelper.dealOnesidedDamage(player, {
        damage,
        damageClass: DamageClass.Physical,
        damageMessage: "You've fallen!",
        suppressIfNegative: true,
        overrideSfx: SoundEffect.CombatHitMelee,
      });
    }

    if (giveAchievement) {
      this.game.achievementsHelper.achievementEarn(player, giveAchievement);
    }

    this.game.movementHelper.postTeleportInteractableActions(player, obj);
  }

  private handleLocker(player: Player, lockerName: string) {
    this.game.lockerHelper.openLocker(player, lockerName);
  }
}
