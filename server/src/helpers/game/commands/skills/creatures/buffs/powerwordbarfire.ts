import { ICharacter, IMacroCommandArgs, IPlayer } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class PowerwordBarFire extends SpellCommand {

  aliases = ['powerword barfire'];
  requiresLearn = true;
  canTargetSelf = true;
  spellDataRef = 'PowerwordBarFire';
  spellRef = 'BarFire';

  canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target) && !this.game.effectHelper.hasEffect(target, 'BarFire');
  }

}
