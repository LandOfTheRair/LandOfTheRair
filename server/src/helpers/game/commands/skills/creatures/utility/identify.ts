import { IMacroCommandArgs, IPlayer } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Identify extends SpellCommand {

  aliases = ['cast identify'];
  requiresLearn = true;
  spellRef = 'Identify';

  execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!this.tryToConsumeMP(player, [], args.overrideEffect)) return;

    this.castSpell(player, player, args);
  }

}
