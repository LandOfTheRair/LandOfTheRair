import { IMacroCommandArgs, IPlayer } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Afflict extends SpellCommand {

  aliases = ['cast afflict'];
  requiresLearn = true;
  spellRef = 'Afflict';

  execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!args.stringArgs) return false;

    const target = this.game.targettingHelper.getFirstPossibleTargetInViewRange(player, args.stringArgs);
    if (!target) return this.youDontSeeThatPerson(player);

    if (target === player) return;

    if (!this.tryToConsumeMP(player, [target], args.overrideEffect)) return;

    this.castSpell(player, target, args);
  }

}
