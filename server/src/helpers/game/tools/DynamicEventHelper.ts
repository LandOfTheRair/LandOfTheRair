import { ObjectId } from 'bson';
import { Injectable } from 'injection-js';
import { cloneDeep, merge, random, sample } from 'lodash';

import {
  DynamicEventSuccessType,
  GameAction,
  IDynamicEvent,
  IDynamicEventMeta,
  INPC,
  Stat,
} from '../../../interfaces';
import { DynamicEvent, Spawner } from '../../../models';

import { BaseService } from '../../../models/BaseService';

@Injectable()
export class DynamicEventHelper extends BaseService {
  private activeEventNames: Record<string, boolean> = {};
  private activeEvents: IDynamicEvent[] = [];
  private statTotals: Partial<Record<Stat, number>> = {};
  private eventCooldowns: Record<string, number> = {};

  public async init() {
    this.activeEvents = await this.game.eventsDB.loadEvents();
    this.cleanStaleEvents();
    this.recalculateStatTotals();
  }

  // check all events for expiration
  public tick(timer) {
    const now = Date.now();

    timer.startTimer(`dynamicevent-${now}`);

    this.activeEvents.forEach((event) => {
      if (event.endsAt > Date.now()) return;

      this.stopEvent(event);
    });

    this.checkOtherEvents();

    timer.stopTimer(`dynamicevent-${now}`);
  }

  // start a new event
  public startEvent(event: IDynamicEvent): void {
    // if we have an event by this name, we update it
    if (this.activeEventNames[event.name]) {
      this.updateEvent(event);
      return;
    }

    const setEvent = new DynamicEvent();
    setEvent._id = new ObjectId();
    merge(setEvent, event);

    this.activeEvents.push(setEvent);
    this.game.eventsDB.createEvent(setEvent);

    this.game.wsCmdHandler.broadcast({
      action: GameAction.EventCreate,
      event: this.game.db.prepareForTransmission(setEvent),
    });

    const eventRef = event.eventRef ?? '';
    if (!eventRef) return;

    const ref = this.getEventRef(eventRef);
    const startMessage = event.eventData?.startMessage ?? ref?.startMessage;
    if (ref && startMessage) {
      this.game.messageHelper.broadcastSystemMessage(startMessage);
    }

    this.recalculateStatTotals();
  }

  // stop an event
  public stopEvent(event: IDynamicEvent): void {
    this.activeEvents = this.activeEvents.filter((x) => x !== event);
    this.game.eventsDB.deleteEvent(event as DynamicEvent);

    this.game.wsCmdHandler.broadcast({
      action: GameAction.EventDelete,
      event: this.game.db.prepareForTransmission(event),
    });

    const eventRef = event.eventRef ?? '';
    if (!eventRef) return;

    const ref = this.getEventRef(eventRef);
    const endMessage = event.eventData?.endMessage ?? ref?.endMessage;
    if (ref && endMessage) {
      this.game.messageHelper.broadcastSystemMessage(endMessage);
      this.eventCooldowns[eventRef] = Date.now() + 1000 * (ref.cooldown ?? 0);
    }

    this.handleSpecialEventsEnd(event);
    this.recalculateStatTotals();

    this.tryToStartFollowUpEvent(event);
  }

  // update an event to have new props (extending a festival f.ex)
  public updateEvent(event: IDynamicEvent): void {
    const updEvent = this.activeEvents.find((x) => x.name === event.name);
    if (!updEvent) return;

    merge(updEvent, event);

    this.game.eventsDB.createEvent(updEvent as DynamicEvent);

    this.game.wsCmdHandler.broadcast({
      action: GameAction.EventCreate,
      event: this.game.db.prepareForTransmission(updEvent),
    });

    this.recalculateStatTotals();
  }

  // get all active events
  public getEvents(): IDynamicEvent[] {
    return this.activeEvents || [];
  }

  // get events formatted to send to a player
  public getEventsForPlayer(): IDynamicEvent[] {
    return this.activeEvents.map((x) => this.game.db.prepareForTransmission(x));
  }

  // get a stat value to boost with (not a percent)
  public getStat(stat: Stat): number {
    return this.statTotals[stat] ?? 0;
  }

  // used to check if there exists an event with this name
  public isEventActive(eventName: string): boolean {
    return this.activeEventNames[eventName];
  }

  // used to check if there exists an event with this name
  public getActiveEvent(eventName: string): IDynamicEvent | undefined {
    return this.activeEvents.find((x) => x.name === eventName);
  }

  // start a dynamic event
  public startDynamicEvent(event: IDynamicEventMeta): void {
    if (!event.name) {
      this.game.logger.error(
        'DynamicEventHelper',
        new Error(`Event ${JSON.stringify(event)} does not have a name!`),
      );
      return;
    }

    if (!this.canDoEvent(event)) return;
    if (!this.existsEnoughPlayersToDoEvent()) return;

    const newEvent = cloneDeep(event);
    this.handleSpecialEventsStart(newEvent);

    this.startEvent({
      description: newEvent.description,
      endsAt: Date.now() + newEvent.duration * 1000,
      name: newEvent.name,
      eventRef: newEvent.name,
      eventData: newEvent,
      extraData: newEvent.extraData ?? {},
    });
  }

  // get a dynamic event ref
  public getEventRef(ref: string): IDynamicEventMeta | undefined {
    return this.game.contentManager.getEvent(ref);
  }

  // recalculate all the stat totals for the events
  private recalculateStatTotals(): void {
    this.activeEventNames = {};
    this.statTotals = {};

    this.getEvents().forEach((event) => {
      this.activeEventNames[event.name] = true;

      Object.keys(event.statBoost || {}).forEach((stat) => {
        this.statTotals[stat] = this.statTotals[stat] ?? 0;
        this.statTotals[stat] += event.statBoost?.[stat] ?? 0;
      });
    });
  }

  private cleanStaleEvents(): void {
    this.activeEvents = this.activeEvents.filter(
      (x) => x.name !== 'Double Trouble',
    );
  }

  // check for other events and start them possibly
  private checkOtherEvents(): void {
    const events = this.game.contentManager.eventsData;
    const settings = this.game.contentManager.settingsData;

    const rarity = settings.event;

    Object.keys(events).forEach((eventName) => {
      const event = this.getEventRef(eventName);
      if (!event) return;

      // if it can't trigger, bail
      if (!this.game.diceRollerHelper.OneInX(rarity[event.rarity] ?? 1000)) {
        return;
      }

      // if it requires a previous event, bail.
      // this is triggered on event end
      if (event.requiresPreviousEvent) return;

      // if the map isn't active, bail
      if (
        event.map &&
        !this.game.worldManager.currentlyActiveMapHash[event.map]
      ) {
        return;
      }

      if (event.npc) {
        let isAlive = false;

        this.game.worldManager.allMapNames.forEach((map) => {
          const mapData = this.game.worldManager.getMap(map);
          if (!mapData || !mapData.state) return;

          mapData.state.allNPCS.forEach((npc) => {
            if (npc.npcId !== event.npc) return;

            isAlive = true;
          });
        });

        if (!isAlive) return;
      }

      // if there's a conflicting event, bail
      if (
        event.conflicts &&
        event.conflicts.some((e) => this.isEventActive(e))
      ) {
        return;
      }

      this.startDynamicEvent(event);
    });
  }

  private handleSpecialEventsStart(event: IDynamicEventMeta): void {
    if (event.name === 'Avatar Spawn') return this.doRareSpawn();
    if (event.name === 'Double Trouble') return this.doDoubleTrouble(event);
  }

  private handleSpecialEventsEnd(event: IDynamicEvent): void {
    if (event.name === 'Double Trouble') return this.undoDoubleTrouble(event);
  }

  private canDoEvent(event: IDynamicEventMeta): boolean {
    if (event.name === 'Avatar Spawn') return this.canDoRareSpawn();
    if (event.name === 'Double Trouble') return this.canDoDoubleTrouble();
    return true;
  }

  private existsEnoughPlayersToDoEvent(): boolean {
    return this.game.playerManager.numPlayersOnline() > 0;
  }

  private canDoDoubleTrouble(): boolean {
    let hasTarget = false;

    this.game.worldManager.allMapNames.forEach((map) => {
      if (hasTarget) return;

      const mapData = this.game.worldManager.getMap(map);
      if (!mapData) return;

      mapData.state.allNPCS.forEach((npc) => {
        if (hasTarget) return;

        if (!this.game.effectHelper.hasEffect(npc, 'Dangerous')) return;
        if (this.game.worldManager.getMap(npc.map)?.map.holiday) return;
        const checkSpawner = this.game.worldManager
          .getMap(npc.map)
          ?.state.getNPCSpawner(npc.uuid);
        if (!checkSpawner) return;

        const checkSpawners = this.game.worldManager
          .getMap(npc.map)
          ?.state.getNPCSpawnersByName(checkSpawner.spawnerName);
        if ((checkSpawners?.length ?? 0) > 1) return;

        hasTarget = true;
      });
    });

    return hasTarget;
  }

  private doDoubleTrouble(event: IDynamicEventMeta): void {
    const targets: INPC[] = [];

    this.game.worldManager.allMapNames.forEach((map) => {
      const mapData = this.game.worldManager.getMap(map);
      if (!mapData) return;

      mapData.state.allNPCS.forEach((npc) => {
        if (!this.game.effectHelper.hasEffect(npc, 'Dangerous')) return;
        if (this.game.worldManager.getMap(npc.map)?.map.holiday) return;
        const checkSpawner = this.game.worldManager
          .getMap(npc.map)
          ?.state.getNPCSpawner(npc.uuid);
        if (!checkSpawner) return;
        if (!checkSpawner.areAnyNPCsAlive) return;
        if (checkSpawner.allNPCS.length > 1) return;

        const checkSpawners = this.game.worldManager
          .getMap(npc.map)
          ?.state.getNPCSpawnersByName(checkSpawner.spawnerName);
        if ((checkSpawners?.length ?? 0) > 1) return;

        targets.push(npc);
      });
    });

    const target = sample(targets);
    if (!target) return;

    const spawner = this.game.worldManager
      .getMap(target.map)
      ?.state.getNPCSpawner(target.uuid);
    if (!spawner) return;

    const npcDef = this.game.npcHelper.getNPCDefinition(target.npcId);
    event.startMessage = `The ether is blurring around "${npcDef.name}", temporarily bringing a clone into the world!`;
    event.description = `There are two "${npcDef.name}" in the world!`;

    event.extraData = {
      map: target.map,
      spawner: spawner.spawnerName,
      name: target.name,
    };

    spawner.forceSpawnNPC();
  }

  private undoDoubleTrouble(event: IDynamicEvent): void {
    if (!event.extraData) return;

    const { map, spawner } = event.extraData;
    const spawnerRef = this.game.worldManager
      .getMap(map)
      ?.state.getNPCSpawnerByName(spawner);
    if (!spawnerRef) return;

    if (spawnerRef.allNPCS.length <= 1) return;

    this.game.deathHelper.fakeNPCDie(spawnerRef.allNPCS[1]);
  }

  private canDoRareSpawn(): boolean {
    const allSpawns = this.game.contentManager.rarespawnsData;
    return Object.keys(allSpawns).some((map) =>
      allSpawns[map].spawns.some(
        (mon) =>
          !this.game.worldManager
            .getMap(map)
            ?.state.getNPCSpawnerByName(`${mon} Spawner`),
      ),
    );
  }

  private doRareSpawn(): void {
    const allSpawns = this.game.contentManager.rarespawnsData;

    let spawnMap;
    let spawnMonster;
    let x;
    let y;

    do {
      spawnMap = sample(Object.keys(allSpawns));
      spawnMonster = sample(allSpawns[spawnMap as string].spawns);

      const mapRef = this.game.worldManager.getMap(spawnMap);
      if (mapRef) {
        const { state: checkState } = mapRef;

        const checkSpawner = checkState.getNPCSpawnerByName(
          `${spawnMonster} Spawner`,
        );
        if (checkSpawner) {
          spawnMap = null;
          spawnMonster = null;
        }
      }
    } while (!spawnMap || !spawnMonster);

    do {
      const mapRef = this.game.worldManager.getMap(spawnMap);
      if (mapRef) {
        const { map: checkMap } = mapRef;

        x = random(4, checkMap.width - 4);
        y = random(4, checkMap.height - 4);

        if (!checkMap.getWallAt(x, y) || checkMap.getDenseDecorAt(x, y)) {
          let isValidSpawn = true;
          for (let xx = x - 2; xx <= x + 2; xx++) {
            for (let yy = y - 2; yy <= y + 2; yy++) {
              if (
                checkMap.getWallAt(xx, yy) ||
                checkMap.getDenseDecorAt(x, y)
              ) {
                isValidSpawn = false;
              }
            }
          }

          if (!isValidSpawn) {
            x = null;
            y = null;
          }
        } else {
          x = null;
          y = null;
        }
      }
    } while (!x || !y);

    const spawnerOpts = {
      name: `${spawnMonster} Spawner`,
      npcIds: [spawnMonster],
      x,
      y,
      maxCreatures: 1,
      respawnRate: 0,
      initialSpawn: 1,
      spawnRadius: 0,
      randomWalkRadius: -1,
      leashRadius: -1,
      shouldStrip: false,
      removeWhenNoNPCs: true,
      removeDeadNPCs: true,
      respectKnowledge: false,
      doInitialSpawnImmediately: true,
      npcCreateCallback: (npc: INPC, npcSpawner: Spawner) => {
        this.game.messageHelper.broadcastSystemMessage(
          `${npc.name} is descending upon ${spawnMap}!`,
        );

        const ai = npcSpawner.getNPCAI(npc.uuid);
        if (ai) {
          ai.death = (killer) => {
            let message = `${npc.name} has been slain by worldly forces!`;
            if (killer) {
              message = `${npc.name} has been slain by ${killer.name}!`;
            }

            this.game.messageHelper.broadcastSystemMessage(message);
          };
        }
      },
    } as Partial<Spawner>;

    const finalMapRef = this.game.worldManager.getMap(spawnMap);
    if (!finalMapRef) return;

    const { map, state } = finalMapRef;

    const spawner = new Spawner(this.game, map, state, {
      ...spawnerOpts,
    } as Partial<Spawner>);

    state.addSpawner(spawner);
  }

  private tryToStartFollowUpEvent(event: IDynamicEvent): void {
    const eventBase = event.eventData;
    if (!eventBase) return;

    const { spawnEventOnFailure, spawnEventOnSuccess, successMetrics } =
      eventBase;
    let startRef: IDynamicEventMeta | undefined;

    if (successMetrics.type === DynamicEventSuccessType.Kills) {
      if (
        (event.extraData?.totalKills ?? 0) >= successMetrics.count &&
        spawnEventOnSuccess
      ) {
        startRef = this.getEventRef(spawnEventOnSuccess);
      }

      if (
        (event.extraData?.totalKills ?? 0) < successMetrics.count &&
        spawnEventOnFailure
      ) {
        startRef = this.getEventRef(spawnEventOnFailure);
      }
    }

    if (startRef) {
      this.startDynamicEvent(startRef);
    }
  }

  public trackNPCKill(npcId: string): void {
    this.activeEvents.forEach((event) => {
      const eventBase = event.eventData;
      if (!eventBase) return;

      if (eventBase.successMetrics.type === DynamicEventSuccessType.Kills) {
        if (eventBase.successMetrics.killNPCs.includes(npcId)) {
          event.extraData ??= {};
          event.extraData.totalKills ??= 0;
          event.extraData.totalKills += 1;
        }
      }
    });
  }
}
