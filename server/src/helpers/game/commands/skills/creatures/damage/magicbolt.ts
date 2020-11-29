import { IMacroCommandArgs, IPlayer } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class MagicBolt extends SpellCommand {

  aliases = ['cast magicbolt'];
  requiresLearn = true;
  spellRef = 'MagicBolt';

  execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!args.stringArgs) return false;

    const target = this.game.targettingHelper.getFirstPossibleTargetInViewRange(player, args.stringArgs);
    if (!target) return this.youDontSeeThatPerson(player);

    if (target === player) return;

    if (!this.tryToConsumeMP(player, [target], args.overrideEffect)) return;

    this.castSpell(player, target, args);
  }

}
