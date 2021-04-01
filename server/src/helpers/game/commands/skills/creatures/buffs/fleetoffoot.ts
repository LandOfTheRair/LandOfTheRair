import { ICharacter, IMacroCommandArgs, IPlayer } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class FleetOfFoot extends SpellCommand {

  aliases = ['fleetoffoot', 'cast fleetoffoot'];
  requiresLearn = true;
  canTargetSelf = true;
  spellRef = 'FleetOfFoot';

  canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target) && !this.game.effectHelper.hasEffect(target, 'FleetOfFoot');
  }

}
