import { IMacroCommandArgs, IPlayer } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class MagicBolt extends SpellCommand {

  aliases = ['cast magicbolt'];
  requiresLearn = true;
  spellRef = 'MagicBolt';

  execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!args.stringArgs) return;

    this.castSpell(player, args);
  }

}
