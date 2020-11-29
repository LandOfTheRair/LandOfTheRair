import { IMacroCommandArgs, IPlayer } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Afflict extends SpellCommand {

  aliases = ['cast afflict'];
  requiresLearn = true;
  spellRef = 'Afflict';

  execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!args.stringArgs) return;

    this.castSpell(player, args);
  }

}
