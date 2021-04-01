import { ICharacter, IMacroCommandArgs, IPlayer } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class PowerwordBarNecro extends SpellCommand {

  aliases = ['powerword barnecro'];
  requiresLearn = true;
  canTargetSelf = true;
  spellDataRef = 'PowerwordBarNecro';
  spellRef = 'BarNecro';

  canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target) && !this.game.effectHelper.hasEffect(target, 'BarNecro');
  }

}
