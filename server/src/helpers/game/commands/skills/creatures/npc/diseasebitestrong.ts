
import { random } from 'lodash';

import { DamageClass, ICharacter, Stat } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class DiseaseBiteStrong extends SpellCommand {

  override aliases = ['diseasebitestrong'];
  override requiresLearn = true;

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return this.game.directionHelper.distFrom(caster, target) === 0
        && !this.game.effectHelper.hasEffect(target, 'Disease');
  }

  override use(executor: ICharacter, target: ICharacter) {
    if (this.game.characterHelper.isPlayer(executor)) return;

    const damage = this.game.diceRollerHelper.diceRoll(4, this.game.characterHelper.getStat(executor, Stat.STR));

    this.game.combatHelper.dealDamage(executor, target, {
      damage,
      damageClass: DamageClass.Physical,
      attackerDamageMessage: 'You bit %0!',
      defenderDamageMessage: '%0 bit you!'
    });

    this.game.effectHelper.addEffect(target, executor, 'Disease', {
      effect: {
        duration: 10,
        extra: { disableMessages: true, disableRecently: true, potency: random(15, 20) }
      }
    });
  }
}
