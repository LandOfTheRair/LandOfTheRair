import { IMacroCommandArgs, IPlayer } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class WaveEmote extends MacroCommand {

  override aliases = ['wave'];
  override canBeInstant = true;
  override canBeFast = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const state = this.game.worldManager.getMapStateForCharacter(player);
    if (!state) return;

    const playersInView = state.getAllPlayersInRange(player, 4);
    const target = this.game.targettingHelper.getFirstPossibleTargetInViewRange(player, args.stringArgs);

    if (!target || args.arrayArgs.length === 0 || target === player) {
      this.sendChatMessage(player, 'You wave!');
      playersInView.filter(element => element !== player).forEach(p => {
        this.sendChatMessage(p, `${player.name} waves!`);
      });
      return;
    }

    this.sendChatMessage(player, `You wave at ${target.name}!`);
    this.sendChatMessage(target, `${player.name} waves at you!`);
    playersInView.filter(element => element !== player && element !== target).forEach(p => {
      this.sendChatMessage(p, `${player.name} waves at ${target.name}!`);
    });

  }

}
