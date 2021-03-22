import { IMacroCommandArgs, IPlayer } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Wellspring extends SpellCommand {

  aliases = ['wellspring', 'cast wellspring'];
  requiresLearn = true;
  spellRef = 'Wellspring';
  canTargetSelf = true;

  execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!this.tryToConsumeMP(player, [], args.overrideEffect)) return;

    this.castSpell(player, args);
  }

}
