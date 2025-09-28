import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class SoroniteSweat extends SpellCommand {
  override aliases = ['art soronitesweat'];
  override requiresLearn = true;
  override targetsFriendly = true;
  override canTargetSelf = true;
  override spellDataRef = 'SoroniteSweat';
  override spellRef = 'SoroniteSweat';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return (
      super.canUse(caster, target) &&
      !this.game.effectHelper.hasEffect(target, 'SoroniteSweat')
    );
  }
}
