import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { MacroCommand } from '../../../../models/macro';

export class LaughEmote extends MacroCommand {
  override aliases = ['laugh'];
  override canBeInstant = true;
  override canBeFast = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const state = this.game.worldManager.getMapStateForCharacter(player);
    if (!state) return;

    const playersInView = state.getAllPlayersInRange(player, 4);
    const target = this.game.targettingHelper.getFirstPossibleTargetInViewRange(
      player,
      args.stringArgs,
    );

    if (!target || args.arrayArgs.length === 0 || target === player) {
      this.sendChatMessage(player, 'You laugh!');
      playersInView
        .filter((element) => element !== player)
        .forEach((p) => {
          this.sendChatMessage(p, `${player.name} laughs!`);
        });
      return;
    }

    this.game.characterHelper.clearAgro(player, target);
    this.sendChatMessage(player, `You laugh with ${target.name}!`);
    this.sendChatMessage(target, `${player.name} laughs with you!`);
    playersInView
      .filter((element) => element !== player && element !== target)
      .forEach((p) => {
        this.sendChatMessage(p, `${player.name} laughs with ${target.name}!`);
      });
  }
}
