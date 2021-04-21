import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Venom extends SpellCommand {

  override aliases = ['venom', 'cast venom'];
  override requiresLearn = true;
  override spellRef = 'Venom';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target) && !this.game.effectHelper.hasEffect(target, 'Venom');
  }

}
