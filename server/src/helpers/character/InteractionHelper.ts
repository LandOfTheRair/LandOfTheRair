
import { Injectable } from 'injection-js';
import { random } from 'lodash';

import { BaseClass, BaseService, ICharacter, ItemClass, ItemSlot, Skill } from '../../interfaces';

@Injectable()
export class InteractionHelper extends BaseService {

  public init() {}

  // return whether or not we opened the door
  public tryToOpenDoor(character: ICharacter, door: any): boolean {
    const properties = door.properties || {};
    const { requireLockpick, skillRequired, requireHeld, requireEventToOpen, lockedIfAlive } = properties;

    if (requireEventToOpen) return false;

    const { state } = this.game.worldManager.getMap(character.map);

    const isCurrentlyOpen = state.isDoorOpen(door.id);

    // if the door is not open and it has some requirements
    if (!isCurrentlyOpen
    && (requireLockpick || requireHeld || lockedIfAlive)) {
      let shouldOpen = false;

      const rightHand = character.items.equipment[ItemSlot.RightHand];
      if (rightHand && this.game.itemHelper.getItemProperty(rightHand, 'itemClass') === ItemClass.Key) {

        if (this.game.itemHelper.isItemBroken(rightHand)) {
          this.game.messageHelper.sendSimpleMessage(character, 'Your key is broken!');
          return false;
        }

        // if we have the right item, open the lock
        if (requireHeld && this.game.characterHelper.hasHeldItem(character, requireHeld)) {
          shouldOpen = true;
          this.game.itemHelper.loseCondition(rightHand, 1000, character);

        // if we don't have the right item, whoops
        } else {
          this.game.itemHelper.loseCondition(rightHand, 500000, character);
          this.game.messageHelper.sendSimpleMessage(character, 'Your key is broken!');
          return false;

        }
      }

      if (requireLockpick
      && skillRequired
      && character.baseClass === BaseClass.Thief
      && this.game.characterHelper.hasHeldItem(character, 'Lockpick', 'right')) {

        const charSkill = this.game.characterHelper.getSkillLevel(character, Skill.Thievery) + random(-2, 2);

        if (charSkill < skillRequired) {
          this.game.messageHelper.sendSimpleMessage(character, 'Your lockpick attempt failed!');
          return false;
        }

        this.game.characterHelper.gainSkill(character, Skill.Thievery, skillRequired);
        this.game.messageHelper.sendSimpleMessage(character, 'You successfully picked the lock!');
        this.game.characterHelper.setRightHand(character, undefined);

        shouldOpen = true;
      }

      if (lockedIfAlive) {
        const isNPCAlive = state.isAnyNPCWithId(lockedIfAlive);
        if (!isNPCAlive) {
          shouldOpen = true;
        } else {
          this.game.messageHelper.sendSimpleMessage(character, 'The door is sealed shut by a magical force.');
          return false;
        }
      }

      if (!shouldOpen) {
        this.game.messageHelper.sendSimpleMessage(character, 'The door is locked.');
        return false;
      }
    }

    if (isCurrentlyOpen) {
      const anyInDoor = state.getAllInRangeRaw({ x: door.x / 64, y: (door.y / 64) - 1 }, 0);
      if (anyInDoor.length > 0) {
        this.game.messageHelper.sendSimpleMessage(character, 'Something is blocking the door.');
        return false;
      }
    }

    this.game.messageHelper.sendSimpleMessage(character, isCurrentlyOpen ? 'You close the door.' : 'You open the door.', isCurrentlyOpen ? 'env-door-close' : 'env-door-open');

    if (isCurrentlyOpen) {
      state.closeDoor(door.id);
    } else {
      state.openDoor(door.id);
    }

    return true;
  }

}
