import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class FrostspikesAura extends SpellCommand {

  override aliases = ['frostspikesaura', 'cast frostspikesaura'];
  override requiresLearn = true;
  override targetsFriendly = true;
  override canTargetSelf = true;
  override spellRef = 'FrostspikesAura';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target)
        && !this.game.effectHelper.hasEffect(target, 'FrostspikesAura');
  }

}
