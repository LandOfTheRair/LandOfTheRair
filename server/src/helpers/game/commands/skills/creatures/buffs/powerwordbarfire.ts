import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class PowerwordBarFire extends SpellCommand {

  override aliases = ['powerword barfire'];
  override requiresLearn = true;
  override canTargetSelf = true;
  override spellDataRef = 'PowerwordBarFire';
  override spellRef = 'BarFire';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target) && !this.game.effectHelper.hasEffect(target, 'BarFire');
  }

}
