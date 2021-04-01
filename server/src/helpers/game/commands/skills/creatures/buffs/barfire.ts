import { ICharacter, IMacroCommandArgs, IPlayer } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class BarFire extends SpellCommand {

  aliases = ['barfire', 'cast barfire'];
  requiresLearn = true;
  canTargetSelf = true;
  spellRef = 'BarFire';

  canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target) && !this.game.effectHelper.hasEffect(target, 'BarFire');
  }

}
