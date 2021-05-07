
import { ObjectId } from 'bson';
import { Injectable } from 'injection-js';
import { merge, random, sample } from 'lodash';

import { GameAction, IDynamicEvent, IDynamicEventData, Stat } from '../../../interfaces';
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
    this.recalculateStatTotals();
  }

  // check all events for expiration
  public tick(timer) {
    timer.startTimer('dynamic event launch/expiration');

    this.activeEvents.forEach(event => {
      if (event.endsAt > Date.now()) return;

      this.stopEvent(event);
    });

    this.checkOtherEvents();

    timer.stopTimer('dynamic event launch/expiration');
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
      event: this.game.db.prepareForTransmission(setEvent)
    });

    const eventRef = event.eventRef ?? '';
    const ref = this.getEventRef(eventRef);
    if (ref) {
      this.game.messageHelper.broadcastSystemMessage(ref.startMessage);

    } else {
      this.game.messageHelper.broadcastSystemMessage(`A new event "${setEvent.name}" has started!`);
    }

    this.recalculateStatTotals();
  }

  // stop an event
  public stopEvent(event: IDynamicEvent): void {
    this.activeEvents = this.activeEvents.filter(x => x !== event);
    this.game.eventsDB.deleteEvent(event as DynamicEvent);

    this.game.wsCmdHandler.broadcast({
      action: GameAction.EventDelete,
      event: this.game.db.prepareForTransmission(event)
    });

    const eventRef = event.eventRef ?? '';
    const ref = this.getEventRef(eventRef);
    if (ref) {
      this.game.messageHelper.broadcastSystemMessage(ref.endMessage);
      this.eventCooldowns[eventRef] = Date.now() + (1000 * (ref.cooldown ?? 0));

    } else {
      this.game.messageHelper.broadcastSystemMessage(`"${event.name}" has ended.`);
    }

    this.recalculateStatTotals();
  }

  // update an event to have new props (extending a festival f.ex)
  public updateEvent(event: IDynamicEvent): void {
    const updEvent = this.activeEvents.find(x => x.name === event.name);
    if (!updEvent) return;

    merge(updEvent, event);

    this.game.eventsDB.createEvent(updEvent as DynamicEvent);

    this.game.wsCmdHandler.broadcast({
      action: GameAction.EventCreate,
      event: this.game.db.prepareForTransmission(updEvent)
    });

    this.recalculateStatTotals();
  }

  // get all active events
  public getEvents(): IDynamicEvent[] {
    return this.activeEvents || [];
  }

  // get events formatted to send to a player
  public getEventsForPlayer(): IDynamicEvent[] {
    return this.activeEvents.map(x => this.game.db.prepareForTransmission(x));
  }

  // get a stat value to boost with (not a percent)
  public getStat(stat: Stat): number {
    return this.statTotals[stat] ?? 0;
  }

  // used to check if there exists an event with this name
  public isEventActive(eventName: string): boolean {
    return this.activeEventNames[eventName];
  }

  // start a dynamic event
  public startDynamicEvent(event: IDynamicEventData): void {
    if (!event.name) {
      this.game.logger.error('DynamicEventHelper', new Error(`Event ${JSON.stringify(event)} does not have a name!`));
      return;
    }

    if (!this.canDoEvent(event)) return;

    this.startEvent({
      description: event.description,
      endsAt: Date.now() + (event.duration * 1000),
      name: event.name,
      eventRef: event.name
    });

    this.handleSpecialEvents(event);
  }

  // get a dynamic event ref
  public getEventRef(ref: string): IDynamicEventData | undefined {
    return this.game.contentManager.getEvent(ref);
  }

  // recalculate all the stat totals for the events
  private recalculateStatTotals(): void {
    this.activeEventNames = {};
    this.statTotals = {};

    this.getEvents().forEach(event => {
      this.activeEventNames[event.name] = true;

      Object.keys(event.statBoost || {}).forEach(stat => {
        this.statTotals[stat] = this.statTotals[stat] ?? 0;
        this.statTotals[stat] += event.statBoost?.[stat] ?? 0;
      });
    });
  }

  // check for other events and start them possibly
  private checkOtherEvents(): void {
    const events = this.game.contentManager.eventsData;
    const settings = this.game.contentManager.settingsData;

    const rarity = settings.event;

    Object.keys(events).forEach(eventName => {
      const event = this.getEventRef(eventName);
      if (!event) return;

      // if it can't trigger, bail
      if (!this.game.diceRollerHelper.OneInX(rarity[event.rarity] ?? 1000)) return;

      // if the map isn't active, bail
      if (event.map && !this.game.worldManager.currentlyActiveMapHash[event.map]) return;

      // if there's a conflicting event, bail
      if (event.conflicts && event.conflicts.some(e => this.isEventActive(e))) return;

      this.startDynamicEvent(event);
    });
  }

  private handleSpecialEvents(event: IDynamicEventData): void {
    if (event.name === 'Avatar Spawn') return this.doRareSpawn();
  }

  private canDoEvent(event: IDynamicEventData): boolean {
    if (event.name === 'Avatar Spawn') return this.canDoRareSpawn();
    return true;
  }

  private canDoRareSpawn(): boolean {
    const allSpawns = this.game.contentManager.rarespawnsData;
    return Object.keys(allSpawns)
      .some(map => allSpawns[map].spawns
        .some(mon => !this.game.worldManager.getMap(map)?.state.getNPCSpawnerByName(`${mon} Spawner`)));
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

        const checkSpawner = checkState.getNPCSpawnerByName(`${spawnMonster} Spawner`);
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
              if (checkMap.getWallAt(xx, yy) || checkMap.getDenseDecorAt(x, y)) {
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
      doInitialSpawnImmediately: true
    } as Partial<Spawner>;

    const finalMapRef = this.game.worldManager.getMap(spawnMap);
    if (!finalMapRef) return;

    const { map, state } = finalMapRef;

    const spawner = new Spawner(this.game, map, state, {
      ...spawnerOpts
    } as Partial<Spawner>);

    state.addSpawner(spawner);

    console.log(spawnMap, spawnMonster, x, y);
  }

}
