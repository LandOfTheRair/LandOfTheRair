import { IMacroCommandArgs, IPlayer } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class HailEmote extends MacroCommand {

  override aliases = ['hail'];
  override canBeInstant = true;
  override canBeFast = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const state = this.game.worldManager.getMapStateForCharacter(player);
    if (!state) return;

    const playersInView = state.getAllPlayersInRange(player, 4);
    const target = this.game.targettingHelper.getFirstPossibleTargetInViewRange(player, args.stringArgs);

    if (!target || args.arrayArgs.length === 0 || target === player) {
      this.sendChatMessage(player, 'You hail!');
      playersInView.filter(element => element !== player).forEach(p => {
        this.sendChatMessage(p, `${player.name} hails!`);
      });
      return;
    }

    this.sendChatMessage(player, `You hail ${target.name}!`);
    this.sendChatMessage(target, `${player.name} hails you!`);
    playersInView.filter(element => element !== player && element !== target).forEach(p => {
      this.sendChatMessage(p, `${player.name} hails ${target.name}!`);
    });

  }

}
