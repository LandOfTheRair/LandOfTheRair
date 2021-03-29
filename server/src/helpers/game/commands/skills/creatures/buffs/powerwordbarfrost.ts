import { ICharacter, IMacroCommandArgs, IPlayer } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class PowerwordBarFrost extends SpellCommand {

  aliases = ['powerword barfrost'];
  requiresLearn = true;
  canTargetSelf = true;
  spellDataRef = 'PowerwordBarFrost';
  spellRef = 'BarFrost';

  canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target) && !this.game.effectHelper.hasEffect(target, 'BarFrost');
  }

  execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!this.tryToConsumeMP(player, [], args.overrideEffect)) return;

    this.castSpell(player, args);
  }

}
