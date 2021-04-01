import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Dispel extends SpellCommand {

  aliases = ['dispel', 'cast dispel'];
  requiresLearn = true;
  spellRef = 'Dispel';

  canUse(caster: ICharacter, target: ICharacter): boolean {
    return this.game.effectHelper.dispellableEffects(target).length > 0;
  }

}
