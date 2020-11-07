import { IMacroCommandArgs, IPlayer } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class Scratch extends MacroCommand {

  aliases = ['scratch'];
  canBeInstant = true;
  canBeFast = true;

  execute(player: IPlayer, args: IMacroCommandArgs) {
    const state = this.game.worldManager.getMapStateForCharacter(player);
    const playersInView = state.getAllPlayersInRange(player, 4);
    const target = this.game.targettingHelper.getFirstPossibleTargetInViewRange(player, args.stringArgs);

    if (!target || args.arrayArgs.length === 0 || target === player) {
      this.sendMessage(player, 'You scratch yourself!');
      playersInView.filter(element => element !== player).forEach(p => {
        this.sendChatMessage(p, `${player.name} scratches ${player.gender === 'male' ? 'himself' : 'herself'}!`);
      });
      return;
    }

    this.game.characterHelper.addAgro(player, target, 1);
    this.sendMessage(player, `You scratch ${target.name}!`);
    this.sendMessage(target, `${player.name} scratches you!`);
    playersInView.filter(element => element !== player && element !== target).forEach(p => {
      this.sendChatMessage(p, `${player.name} scratches ${target.name}!`);
    });

  }

}
