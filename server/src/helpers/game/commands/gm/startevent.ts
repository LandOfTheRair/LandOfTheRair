import { IMacroCommandArgs, IPlayer } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class GMStartEvent extends MacroCommand {

  override aliases = ['@event'];
  override isGMCommand = true;
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!args.stringArgs) return this.sendMessage(player, 'You need to specify an event.');

    const eventRef = this.game.dynamicEventHelper.getEventRef(args.stringArgs);
    if (!eventRef) return this.sendMessage(player, 'That event does not exist.');

    this.game.dynamicEventHelper.startDynamicEvent(eventRef);
  }
}
