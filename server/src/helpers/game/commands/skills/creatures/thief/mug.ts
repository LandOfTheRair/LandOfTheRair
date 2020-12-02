import { IMacroCommandArgs, IPlayer } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Mug extends SpellCommand {

  aliases = ['mug'];
  requiresLearn = true;
  spellRef = 'Mug';

  execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!args.stringArgs) return;

    this.castSpell(player, args);
  }

}
