import { IMacroCommandArgs, IPlayer } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class GMStartEvent extends MacroCommand {
  override aliases = ['@event'];
  override isGMCommand = true;
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!args.stringArgs) {
      return this.sendMessage(player, 'You need to specify an event.');
    }

    const [eventName, map] = args.stringArgs.split('=');

    const eventRef = structuredClone(
      this.game.dynamicEventHelper.getEventRef(eventName),
    );
    if (!eventRef) {
      return this.sendMessage(player, 'That event does not exist.');
    }

    eventRef.extraData = { map };

    if (this.game.dynamicEventHelper.isEventActive(eventRef.name)) {
      const event = this.game.dynamicEventHelper.getActiveEvent(eventRef.name);
      if (!event) return;

      this.game.dynamicEventHelper.stopEvent(event);
      return;
    }

    this.game.dynamicEventHelper.startDynamicEvent(eventRef);
  }
}
