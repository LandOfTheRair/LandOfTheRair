import { Injectable } from 'injection-js';
import { random } from 'lodash';

import { getSkillLevel, hasHeldItem } from '@lotr/characters';
import type { ICharacter, IPlayer } from '@lotr/interfaces';
import { ItemClass, ItemSlot, Skill, SoundEffect } from '@lotr/interfaces';
import { distanceFrom, positionWorldXYToTile } from '@lotr/shared';
import { BaseService } from '../../models/BaseService';

@Injectable()
export class InteractionHelper extends BaseService {
  public init() {}

  // return whether or not we opened the door
  public tryToOpenDoor(character: ICharacter, door: any): boolean {
    const properties = door.properties || {};
    const {
      requireLockpick,
      skillRequired,
      requireHeld,
      requireEventToOpen,
      lockedIfAlive,
    } = properties;

    if (requireEventToOpen) return false;

    if (distanceFrom(character, positionWorldXYToTile(door)) > 1) {
      this.game.messageHelper.sendSimpleMessage(
        character,
        "You can't reach the door!",
      );
      return false;
    }

    const state = this.game.worldManager.getMap(character.map)?.state;
    if (!state) return false;

    const isCurrentlyOpen = state.isDoorOpen(door.id);

    // if the door is not open and it has some requirements
    if (!isCurrentlyOpen && (requireLockpick || requireHeld || lockedIfAlive)) {
      let shouldOpen = false;

      const rightHand = character.items.equipment[ItemSlot.RightHand];
      if (
        rightHand &&
        this.game.itemHelper.getItemProperty(rightHand, 'itemClass') ===
          ItemClass.Key
      ) {
        if (this.game.itemHelper.isItemBroken(rightHand)) {
          this.game.messageHelper.sendSimpleMessage(
            character,
            'Your key is broken!',
          );
          return false;
        }

        // if we have the right item, open the lock
        if (requireHeld && hasHeldItem(character, requireHeld)) {
          shouldOpen = true;
          this.game.itemHelper.loseCondition(rightHand, 1000, character);

          // if we don't have the right item, whoops
        } else {
          this.game.itemHelper.loseCondition(rightHand, 5000, character);
          this.game.messageHelper.sendSimpleMessage(
            character,
            'The key does not fit in the lock!',
          );
          return false;
        }
      }

      const canLockpick =
        this.game.contentManager.getClassConfigSetting<'canLockpick'>(
          character.baseClass,
          'canLockpick',
        );

      if (
        requireLockpick &&
        skillRequired &&
        canLockpick &&
        hasHeldItem(character, 'Lockpick', 'right')
      ) {
        const fuzz =
          this.game.contentManager.getGameSetting(
            'character',
            'thiefLockpickFuzz',
          ) ?? 2;

        const charSkill =
          getSkillLevel(character, Skill.Thievery) +
          random(-fuzz, fuzz) +
          this.game.traitHelper.traitLevelValue(character, 'LockpickSpecialty');

        if (charSkill < skillRequired) {
          this.game.messageHelper.sendSimpleMessage(
            character,
            'Your lockpick attempt failed!',
          );
          return false;
        }

        this.game.playerHelper.tryGainSkill(
          character as IPlayer,
          Skill.Thievery,
          skillRequired,
        );
        this.game.messageHelper.sendSimpleMessage(
          character,
          'You successfully picked the lock!',
        );
        this.game.characterHelper.setRightHand(character, undefined);

        shouldOpen = true;
      }

      if (lockedIfAlive) {
        const isNPCAlive = state.isAnyNPCWithId(lockedIfAlive);
        if (!isNPCAlive) {
          shouldOpen = true;
        } else {
          this.game.messageHelper.sendSimpleMessage(
            character,
            'The door is sealed shut by a magical force.',
          );
          return false;
        }
      }

      if (!shouldOpen) {
        this.game.messageHelper.sendSimpleMessage(
          character,
          'The door is locked.',
        );
        return false;
      }
    }

    if (isCurrentlyOpen) {
      const anyInDoor = state.getAllInRangeRaw(
        { x: door.x / 64, y: door.y / 64 - 1 },
        0,
      );
      if (anyInDoor.length > 0) {
        this.game.messageHelper.sendSimpleMessage(
          character,
          'Something is blocking the door.',
        );
        return false;
      }
    }

    this.game.messageHelper.sendSimpleMessage(
      character,
      isCurrentlyOpen ? 'You close the door.' : 'You open the door.',
      isCurrentlyOpen ? SoundEffect.EnvDoorClose : SoundEffect.EnvDoorOpen,
    );

    if (isCurrentlyOpen) {
      state.closeDoor(door.id);
    } else {
      state.openDoor(door.id);
    }

    return true;
  }

  // open a treasure chest
  public openChest(character: ICharacter, chest: any): void {
    if (!chest.searchItems || chest.searchItems.length === 0) return;

    this.game.groundManager.lootChest(character.map, chest.name);
    this.game.worldManager
      .getMap(character.map)
      ?.state.addItemsToGround(character.x, character.y, chest.searchItems);
    chest.searchItems = [];
  }
}
