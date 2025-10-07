import { settingGameGet } from '@lotr/content';
import type { ICharacter, IPlayer, ISimpleItem } from '@lotr/interfaces';
import { ItemClass, ItemSlot } from '@lotr/interfaces';
import { Injectable } from 'injection-js';
import { BaseService } from '../../models/BaseService';

@Injectable()
export class CorpseManager extends BaseService {
  private corpseRefs: Record<string, ISimpleItem> = {}; // corpseuuid:corpseitem
  private corpsePlayers: Record<string, string> = {}; // the record of username:corpseuuid
  private corpsePositions: Record<
    string,
    { x: number; y: number; map: string }
  > = {}; // corpseuuid:map,x,y
  private playerCorpseRefs: Record<string, ISimpleItem> = {}; // username:corpseitem
  private corpseExpiration: Record<string, number> = {}; // corpseuuid:rottime

  public async init() {}

  public tick(timer) {
    const now = Date.now();

    const activeMaps = this.game.worldManager.currentlyActiveMapHash;

    timer.startTimer(`corpseexpiration-${now}`);

    Object.keys(this.corpseExpiration).forEach((corpseUUID) => {
      const expTime = this.corpseExpiration[corpseUUID];
      const corpsePos = this.corpsePositions[corpseUUID];
      if (expTime > now || !activeMaps[corpsePos.map]) return;

      this.searchCorpse(corpseUUID);
      this.game.worldManager
        .getMap(corpsePos.map)
        ?.state.removeItemFromGround(
          corpsePos.x,
          corpsePos.y,
          ItemClass.Corpse,
          corpseUUID,
        );
    });

    timer.stopTimer(`corpseexpiration-${now}`);
  }

  // add a corpse to special management
  public addCorpse(
    map: string,
    corpse: ISimpleItem,
    x: number,
    y: number,
  ): void {
    const uuid = corpse.uuid;
    const corpseUsername = corpse.mods.corpseUsername;

    const { playerExpire, npcExpire } = settingGameGet('corpse');

    this.corpseExpiration[uuid] =
      Date.now() +
      1000 * (corpseUsername ? (playerExpire ?? 500) : (npcExpire ?? 120));

    this.corpsePositions[uuid] = { map, x, y };
    this.corpseRefs[uuid] = corpse;

    if (corpseUsername) {
      this.corpsePlayers[corpseUsername] = uuid;
      this.playerCorpseRefs[corpseUsername] = corpse;
    }
  }

  // remove a corpse from special management
  public removeCorpse(corpse: ISimpleItem): void {
    delete this.corpseExpiration[corpse.uuid];
    delete this.corpsePositions[corpse.uuid];
    delete this.corpseRefs[corpse.uuid];
    delete this.corpsePlayers[corpse.mods?.corpseUsername ?? ''];
  }

  // remove a player corpse - requires a call at a special time so it isn't just removed while players are holding it
  public removePlayerCorpse(username: string): void {
    const corpse = this.playerCorpseRefs[username];
    if (!corpse) return;

    this.removeCorpse(corpse);
    delete this.playerCorpseRefs[username];

    const { lastHeldBy, lastMap, lastX, lastY } = corpse.mods;
    if (lastHeldBy) {
      // if this is ever a NPC holding a player corpse, this will not work
      const holdingPlayer =
        this.game.playerManager.getPlayerByUsername(lastHeldBy);
      if (holdingPlayer) {
        if (
          holdingPlayer.items.equipment[ItemSlot.RightHand]?.uuid ===
          corpse.uuid
        ) {
          this.game.characterHelper.setRightHand(holdingPlayer, undefined);
        }

        if (
          holdingPlayer.items.equipment[ItemSlot.LeftHand]?.uuid === corpse.uuid
        ) {
          this.game.characterHelper.setLeftHand(holdingPlayer, undefined);
        }

        this.game.messageHelper.sendLogMessageToPlayer(holdingPlayer, {
          message: 'Your corpse has turned to dust in your hands.',
        });
      }
    } else if (lastMap && lastX !== undefined && lastY !== undefined) {
      this.game.worldManager
        .getMap(lastMap)
        ?.state.removeItemFromGround(
          lastX,
          lastY,
          ItemClass.Corpse,
          corpse.uuid,
        );
    }
  }

  // search a lot of corpses. they all are assumed to be in the same spot.
  public searchCorpses(uuids: string[]): void {
    const firstCorpse = this.corpsePositions[uuids[0]];
    if (!firstCorpse) return;

    const allItems: ISimpleItem[] = [];

    uuids.forEach((uuid) => {
      const corpseRef = this.corpseRefs[uuid];
      if (!corpseRef || !corpseRef.mods.searchItems) return;

      allItems.push(...(corpseRef.mods.searchItems ?? []));
      corpseRef.mods.searchItems = [];
    });

    this.game.worldManager
      .getMap(firstCorpse.map)
      ?.state.addItemsToGround(firstCorpse.x, firstCorpse.y, allItems);
  }

  // get a reference to a corpse, if possible
  public getCorpseRef(search: string): ISimpleItem | undefined {
    return (
      this.playerCorpseRefs[search] ||
      this.corpseRefs[this.corpsePlayers[search]] ||
      this.corpseRefs[search]
    );
  }

  // delete any corpses from a player's hands without dropping them on the ground (called on game join)
  public deleteCorpsesFromHandsOfPlayer(player: IPlayer): void {
    const rightHand = player.items.equipment[ItemSlot.RightHand];
    const leftHand = player.items.equipment[ItemSlot.LeftHand];

    if (
      rightHand &&
      this.game.itemHelper.getItemProperty(rightHand, 'itemClass') ===
        ItemClass.Corpse
    ) {
      this.game.characterHelper.setRightHand(player, undefined);
    }
    if (
      leftHand &&
      this.game.itemHelper.getItemProperty(leftHand, 'itemClass') ===
        ItemClass.Corpse
    ) {
      this.game.characterHelper.setLeftHand(player, undefined);
    }
  }

  // force a player to drop any corpses they are holding (called on game quit)
  public forciblyDropCorpsesHeldByPlayer(player: IPlayer): void {
    const rightHand = player.items.equipment[ItemSlot.RightHand];
    const leftHand = player.items.equipment[ItemSlot.LeftHand];

    if (
      rightHand &&
      this.game.itemHelper.getItemProperty(rightHand, 'itemClass') ===
        ItemClass.Corpse
    ) {
      this.game.corpseManager.movePlayerCorpseOntoMap(rightHand, player);
      this.game.characterHelper.dropHand(player, 'right');
    }

    if (
      leftHand &&
      this.game.itemHelper.getItemProperty(leftHand, 'itemClass') ===
        ItemClass.Corpse
    ) {
      this.game.corpseManager.movePlayerCorpseOntoMap(leftHand, player);
      this.game.characterHelper.dropHand(player, 'left');
    }
  }

  // move a corpse from the map into a players hands
  public markPlayerCorpseHeld(
    corpse: ISimpleItem,
    character: ICharacter,
  ): void {
    if (!corpse.mods.corpseUsername) return;
    this.playerCorpseRefs[corpse.mods.corpseUsername] = corpse;

    corpse.mods.lastHeldBy = (character as IPlayer).username;
    delete corpse.mods.lastX;
    delete corpse.mods.lastY;
    delete corpse.mods.lastMap;
  }

  // move a corpse from a players hands onto the map
  public movePlayerCorpseOntoMap(
    corpse: ISimpleItem,
    heldBy: ICharacter,
  ): void {
    if (!corpse.mods.corpseUsername) return;
    this.playerCorpseRefs[corpse.mods.corpseUsername] = corpse;

    corpse.mods.lastHeldBy = undefined;
    corpse.mods.lastX = heldBy.x;
    corpse.mods.lastY = heldBy.y;
    corpse.mods.lastMap = heldBy.map;
  }

  // search a corpse and drop its items on the ground
  public searchCorpse(uuid: string): void {
    const corpseRef = this.corpseRefs[uuid];
    if (!corpseRef || !corpseRef.mods.searchItems) return;

    const corpsePos = this.corpsePositions[uuid];
    this.game.worldManager
      .getMap(corpsePos.map)
      ?.state.addItemsToGround(
        corpsePos.x,
        corpsePos.y,
        corpseRef.mods.searchItems ?? [],
      );
    corpseRef.mods.searchItems = [];
  }
}
