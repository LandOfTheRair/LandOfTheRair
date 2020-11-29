import { IMacroCommandArgs, IPlayer } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class MagicMissile extends SpellCommand {

  aliases = ['cast magicmissile'];
  requiresLearn = true;
  spellRef = 'MagicMissile';

  execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!args.stringArgs) return;

    this.castSpell(player, args);
  }

}
