import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Dispel extends SpellCommand {

  override aliases = ['dispel', 'cast dispel'];
  override requiresLearn = true;
  override spellRef = 'Dispel';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return this.game.effectHelper.dispellableEffects(target).length > 0;
  }

}
