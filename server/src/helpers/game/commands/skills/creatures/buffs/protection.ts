import { ICharacter, IMacroCommandArgs, IPlayer } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Protection extends SpellCommand {

  aliases = ['protection', 'cast protection'];
  requiresLearn = true;
  canTargetSelf = true;
  spellRef = 'Protection';

  canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target) && !this.game.effectHelper.hasEffect(target, 'Protection');
  }

}
