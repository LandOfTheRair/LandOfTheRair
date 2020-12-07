
import { Injectable } from 'injection-js';
import { ISimpleItem, ItemClass, ItemSlot } from '../../interfaces';
import { BaseService } from '../../models/BaseService';

@Injectable()
export class CorpseManager extends BaseService {

  private corpseRefs: Record<string, ISimpleItem> = {};                                  // corpseuuid:corpseitem
  private corpsePlayers: Record<string, string> = {};                                    // the record of username:corpseuuid
  private corpsePositions: Record<string, { x: number, y: number, map: string }> = {};   // corpseuuid:map,x,y
  private corpseExpiration: Record<string, number> = {};                                 // corpseuuid:rottime

  public async init() {}

  public tick(timer) {
    const now = Date.now();

    const activeMaps = this.game.worldManager.currentlyActiveMapHash;

    timer.startTimer('corpse expiration');

    Object.keys(this.corpseExpiration).forEach(corpseUUID => {
      const expTime = this.corpseExpiration[corpseUUID];
      const corpsePos = this.corpsePositions[corpseUUID];
      if (expTime > now || !activeMaps[corpsePos.map]) return;

      this.searchCorpse(corpseUUID);
      this.game.worldManager.getMap(corpsePos.map).state.removeItemFromGround(corpsePos.x, corpsePos.y, ItemClass.Corpse, corpseUUID);
    });

    timer.stopTimer('corpse expiration');
  }

  // add a corpse to special management
  public addCorpse(map: string, corpse: ISimpleItem, x: number, y: number): void {
    const uuid = corpse.uuid;
    const corpseUsername = corpse.mods.corpseUsername;

    this.corpseExpiration[uuid] = Date.now() + (1000 * (corpseUsername ? 500 : 120));
    this.corpsePositions[uuid] = { map, x, y };
    this.corpseRefs[uuid] = corpse;

    if (corpseUsername) {
      this.corpsePlayers[corpseUsername] = uuid;
    }
  }

  // remove a corpse from special management
  public removeCorpse(corpse: ISimpleItem): void {
    delete this.corpseExpiration[corpse.uuid];
    delete this.corpsePositions[corpse.uuid];
    delete this.corpseRefs[corpse.uuid];
    delete this.corpsePlayers[corpse.mods?.corpseUsername ?? ''];
  }

  // search a lot of corpses. they all are assumed to be in the same spot.
  public searchCorpses(uuids: string[]): void {
    const firstCorpse = this.corpsePositions[uuids[0]];
    if (!firstCorpse) return;

    const allItems: ISimpleItem[] = [];

    uuids.forEach(uuid => {
      const corpseRef = this.corpseRefs[uuid];
      if (!corpseRef || !corpseRef.mods.searchItems) return;

      allItems.push(...(corpseRef.mods.searchItems ?? []));
      delete corpseRef.mods.searchItems;
    });

    this.game.worldManager.getMap(firstCorpse.map).state.addItemsToGround(firstCorpse.x, firstCorpse.y, allItems);
  }

  // search a corpse and drop its items on the ground
  public searchCorpse(uuid: string): void {
    const corpseRef = this.corpseRefs[uuid];
    if (!corpseRef || !corpseRef.mods.searchItems) return;

    const corpsePos = this.corpsePositions[uuid];
    this.game.worldManager.getMap(corpsePos.map).state.addItemsToGround(corpsePos.x, corpsePos.y, corpseRef.mods.searchItems ?? []);
    delete corpseRef.mods.searchItems;
  }

  public removeCorpseFromAnyonesHands(uuid: string): void {
    this.game.playerManager.getAllPlayers().forEach(p => {
      const rightHand = p.items.equipment[ItemSlot.RightHand];
      const leftHand = p.items.equipment[ItemSlot.LeftHand];

      if (rightHand && rightHand.uuid === uuid) {
        this.game.messageHelper.sendLogMessageToPlayer(p, { message: 'The corpse turns to dust in your hands.' });
        this.game.characterHelper.setRightHand(p, undefined);
      }

      if (leftHand && leftHand.uuid === uuid) {
        this.game.messageHelper.sendLogMessageToPlayer(p, { message: 'The corpse turns to dust in your hands.' });
        this.game.characterHelper.setLeftHand(p, undefined);
      }
    });
  }

}
