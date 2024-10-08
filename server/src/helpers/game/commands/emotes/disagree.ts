import { IMacroCommandArgs, IPlayer } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class DisagreeEmote extends MacroCommand {

  override aliases = ['disagree'];
  override canBeInstant = true;
  override canBeFast = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const state = this.game.worldManager.getMapStateForCharacter(player);
    if (!state) return;

    const playersInView = state.getAllPlayersInRange(player, 4);
    const target = this.game.targettingHelper.getFirstPossibleTargetInViewRange(player, args.stringArgs);

    if (!target || args.arrayArgs.length === 0 || target === player) {
      this.sendChatMessage(player, 'You disagree!');
      playersInView.filter(element => element !== player).forEach(p => {
        this.sendChatMessage(p, `${player.name} disagrees!`);
      });
      return;
    }

    this.sendChatMessage(player, `You disagree with ${target.name}!`);
    this.sendChatMessage(target, `${player.name} disagrees with you!`);
    playersInView.filter(element => element !== player && element !== target).forEach(p => {
      this.sendChatMessage(p, `${player.name} disagrees with ${target.name}!`);
    });

  }

}
