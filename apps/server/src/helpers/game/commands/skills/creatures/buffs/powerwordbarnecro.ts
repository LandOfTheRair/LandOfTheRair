import type { ICharacter } from '@lotr/interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class PowerwordBarNecro extends SpellCommand {
  override aliases = ['powerword barnecro'];
  override requiresLearn = true;
  override targetsFriendly = true;
  override canTargetSelf = true;
  override spellDataRef = 'PowerwordBarNecro';
  override spellRef = 'BarNecro';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return (
      super.canUse(caster, target) &&
      !this.game.effectHelper.hasEffect(target, 'BarNecro')
    );
  }
}
