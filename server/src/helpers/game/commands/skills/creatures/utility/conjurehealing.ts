import { IMacroCommandArgs, IPlayer } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class ConjureHealing extends SpellCommand {

  aliases = ['conjurehealing', 'cast conjurehealing'];
  requiresLearn = true;
  spellRef = 'ConjureHealing';
  canTargetSelf = true;

  execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!this.tryToConsumeMP(player, [], args.overrideEffect)) return;

    this.castSpell(player, args);
  }

}
