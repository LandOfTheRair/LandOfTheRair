
import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class PullOne extends SpellCommand {

  override aliases = ['pullone'];
  override requiresLearn = true;

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return this.game.directionHelper.distFrom(caster, target) > 0;
  }

  override use(executor: ICharacter, target: ICharacter) {
    if (this.game.characterHelper.isPlayer(executor)) return;

    this.game.spellManager.castSpell('Pull', executor, target);
  }
}
