import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { Tradeskill } from '@lotr/interfaces';
import { MacroCommand } from '../../../../models/macro';

export class GMGainTradeskill extends MacroCommand {
  override aliases = ['@gaintradeskill', '@tradeskill', '@ts'];
  override isGMCommand = true;
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!args.stringArgs) {
      this.sendMessage(player, 'Syntax: TradeskillName Amount');
      return;
    }

    const skill = Tradeskill[args.stringArgs.split(' ')[0]];
    const value = Math.round(+args.stringArgs.split(' ')[1]);

    if (!skill) {
return this.sendMessage(player, 'That is not a valid tradeskill name.');
}

    try {
      this.game.playerHelper.gainTradeskill(player, skill, value);
      this.sendMessage(player, `You gained ${value} skill in ${skill}.`);
    } catch (e) {
      this.sendMessage(player, `@tradeskill function failed. ${e}`);
    }
  }
}
