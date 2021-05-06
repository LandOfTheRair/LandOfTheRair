
import { ObjectId } from 'bson';
import { Injectable } from 'injection-js';
import { merge } from 'lodash';

import { GameAction, IDynamicEvent, IDynamicEventData, Stat } from '../../../interfaces';
import { DynamicEvent } from '../../../models';

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

    this.startEvent({
      description: event.description,
      endsAt: Date.now() + (event.duration * 1000),
      name: event.name,
      eventRef: event.name
    });
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

}
