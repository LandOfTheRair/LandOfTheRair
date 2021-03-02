
import { ObjectId } from 'bson';
import { Injectable } from 'injection-js';
import { merge } from 'lodash';

import { GameAction, IDynamicEvent, Stat } from '../../../interfaces';
import { DynamicEvent } from '../../../models';

import { BaseService } from '../../../models/BaseService';

@Injectable()
export class DynamicEventHelper extends BaseService {

  private activeEventNames: Record<string, boolean> = {};
  private activeEvents: IDynamicEvent[] = [];
  private statTotals: Partial<Record<Stat, number>> = {};

  public async init() {
    this.activeEvents = await this.game.eventsDB.loadEvents();
    this.recalculateStatTotals();
  }

  // check all events for expiration
  public tick(timer) {
    timer.startTimer('dynamic event expiration');

    this.activeEvents.forEach(event => {
      if (event.endsAt > Date.now()) return;

      this.stopEvent(event);
    });

    timer.stopTimer('dynamic event expiration');
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

    this.game.messageHelper.broadcastSystemMessage(`A new event "${setEvent.name}" has started!`);

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

  // recalculate all the stat totals for the events
  private recalculateStatTotals(): void {
    this.activeEventNames = {};

    this.getEvents().forEach(event => {
      this.activeEventNames[event.name] = true;

      Object.keys(event.statBoost || {}).forEach(stat => {
        this.statTotals[stat] = this.statTotals[stat] ?? 0;
        this.statTotals[stat] += event.statBoost?.[stat] ?? 0;
      });
    });
  }

}
