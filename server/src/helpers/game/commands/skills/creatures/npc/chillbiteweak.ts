

import { DamageClass, ICharacter, Stat } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class ChillBiteWeak extends SpellCommand {

  override aliases = ['chillbiteweak'];
  override requiresLearn = true;

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return this.game.directionHelper.distFrom(caster, target) === 0;
  }

  override use(executor: ICharacter, target: ICharacter) {
    if (this.game.characterHelper.isPlayer(executor)) return;

    const damage = this.game.diceRollerHelper.diceRoll(2, this.game.characterHelper.getStat(executor, Stat.STR));

    this.game.combatHelper.dealDamage(executor, target, {
      damage,
      damageClass: DamageClass.Ice,
      attackerDamageMessage: 'You sunk cold fangs into %0!',
      defenderDamageMessage: '%0 sunk cold fangs into you!'
    });
  }
}
