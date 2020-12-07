import { IMacroCommandArgs, IPlayer } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Identify extends SpellCommand {

  aliases = ['identify', 'cast identify'];
  requiresLearn = true;
  spellRef = 'Identify';
  canTargetSelf = true;

  execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!this.tryToConsumeMP(player, [], args.overrideEffect)) return;

    this.castSpell(player, args);
  }

}
