

import { DamageClass, distanceFrom, ICharacter, Stat } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class HeatBiteMedium extends SpellCommand {

  override aliases = ['heatbitemedium'];
  override requiresLearn = true;

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return distanceFrom(caster, target) === 0
        && !this.game.effectHelper.hasEffect(target, 'Burning')
        && !this.game.effectHelper.hasEffect(target, 'RecentlyBurned');
  }

  override use(executor: ICharacter, target: ICharacter) {
    if (this.game.characterHelper.isPlayer(executor)) return;

    const damage = this.game.diceRollerHelper.diceRoll(4, this.game.characterHelper.getStat(executor, Stat.STR));

    this.game.combatHelper.magicalAttack(executor, target, {
      damage,
      damageClass: DamageClass.Fire,
      atkMsg: 'You sunk hot fangs into %0!',
      defMsg: '%0 sunk hot fangs into you!'
    });
  }
}
