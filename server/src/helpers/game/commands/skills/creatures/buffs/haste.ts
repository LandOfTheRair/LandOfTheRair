import { ICharacter, IMacroCommandArgs, IPlayer } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Haste extends SpellCommand {

  aliases = ['haste', 'cast haste'];
  requiresLearn = true;
  canTargetSelf = true;
  spellRef = 'Haste';

  canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target) && !this.game.effectHelper.hasEffect(target, 'Haste');
  }

}
