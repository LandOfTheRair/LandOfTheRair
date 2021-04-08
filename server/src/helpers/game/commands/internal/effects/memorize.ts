
import { IMacroCommandArgs, IPlayer } from '../../../../../interfaces';
import { MacroCommand } from '../../../../../models/macro';

export class MemorizeCommand extends MacroCommand {

  override aliases = ['memorize'];

  override execute(player: IPlayer, args: IMacroCommandArgs) {

    if (!this.game.characterHelper.hasLearned(player, 'Teleport')) {
      this.sendMessage(player, 'You do not have the ability to teleport!');
      return;
    }

    if (!args.stringArgs) {
      this.sendMessage(player, 'You need to name this teleport location!');
      return;
    }

    const didMemorize = this.game.teleportHelper.memorizeLocation(player, args.stringArgs);
    if (!didMemorize) return;

    this.sendMessage(player, 'You spend a moment taking in your surroundings...');

    this.game.effectHelper.addEffect(player, '', 'Stun', { effect: { duration: 5 } });
  }

}
