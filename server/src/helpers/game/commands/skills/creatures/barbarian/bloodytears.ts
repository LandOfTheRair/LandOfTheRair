import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class BloodyTears extends SpellCommand {
  override aliases = ['art bloodytears'];
  override requiresLearn = true;
  override targetsFriendly = true;
  override canTargetSelf = true;
  override spellDataRef = 'BloodyTears';
  override spellRef = 'BloodyTears';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return (
      super.canUse(caster, target) &&
      !this.game.effectHelper.hasEffect(target, 'BloodyTears')
    );
  }
}
