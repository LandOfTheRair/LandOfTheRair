import { IMacroCommandArgs, IPlayer } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Succor extends SpellCommand {

  aliases = ['succor', 'cast succor'];
  requiresLearn = true;
  spellRef = 'Succor';
  canTargetSelf = true;

  execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!this.tryToConsumeMP(player, [], args.overrideEffect)) return;

    this.castSpell(player, args);
  }

}
