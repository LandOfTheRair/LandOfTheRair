import { IMacroCommandArgs, IPlayer } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Fate extends SpellCommand {

  override aliases = ['fate', 'cast fate'];
  override requiresLearn = true;
  override spellRef = 'Fate';
  override canTargetSelf = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (player.exp < this.game.calculatorHelper.calculateXPRequiredForLevel(15) || player.level < 15) {
      return this.sendMessage(player, 'Hmmm... you feel too inexperienced for this.');
    }

    this.castSpellAt(player, player, args);
  }

}
