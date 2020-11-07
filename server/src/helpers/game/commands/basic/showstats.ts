import { IMacroCommandArgs, IPlayer, ISimpleItem, Skill, Stat } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

export class ShowStats extends MacroCommand {

  aliases = ['show stats'];
  canBeInstant = false;
  canBeFast = true;

  execute(player: IPlayer, args: IMacroCommandArgs) {
    this.sendMessage(player, `You are ${player.name}, the ${player.alignment} level ${player.level} ${player.baseClass}.`);
    this.sendMessage(player, `Your allegiance lies with ${player.allegiance === 'None' ? 'no one' : `the ${player.allegiance}`}.`);

    Object.keys(player.stats).forEach(key => {
      this.sendMessage(player, `Your ${key.toUpperCase()} is ${this.game.characterHelper.getStat(player, key as Stat)}`);
    });
  }
}
