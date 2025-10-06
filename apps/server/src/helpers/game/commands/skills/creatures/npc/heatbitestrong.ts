import type { ICharacter } from '@lotr/interfaces';
import { DamageClass, Stat } from '@lotr/interfaces';

import { distanceFrom } from '@lotr/shared';
import { SpellCommand } from '../../../../../../models/macro';

export class HeatBiteStrong extends SpellCommand {
  override aliases = ['heatbitestrong'];
  override requiresLearn = true;

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return (
      distanceFrom(caster, target) === 0 &&
      !this.game.effectHelper.hasEffect(target, 'Burning') &&
      !this.game.effectHelper.hasEffect(target, 'RecentlyBurned')
    );
  }

  override mpCost(): number {
    return 0;
  }

  override use(executor: ICharacter, target: ICharacter) {
    if (this.game.characterHelper.isPlayer(executor)) return;

    const damage = this.game.diceRollerHelper.diceRoll(
      6,
      this.game.characterHelper.getStat(executor, Stat.STR),
    );

    this.game.combatHelper.magicalAttack(executor, target, {
      damage,
      damageClass: DamageClass.Fire,
      atkMsg: 'You sunk hot fangs into %0!',
      defMsg: '%0 sunk hot fangs into you!',
    });
  }
}
