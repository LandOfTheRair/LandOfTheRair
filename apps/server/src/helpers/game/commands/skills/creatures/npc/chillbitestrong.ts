import type { ICharacter } from '@lotr/interfaces';
import { DamageClass, Stat } from '@lotr/interfaces';
import { distanceFrom } from '@lotr/shared';
import { SpellCommand } from '../../../../../../models/macro';

export class ChillBiteStrong extends SpellCommand {
  override aliases = ['chillbitestrong'];
  override requiresLearn = true;

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return (
      distanceFrom(caster, target) === 0 &&
      !this.game.effectHelper.hasEffect(target, 'Chilled') &&
      !this.game.effectHelper.hasEffect(target, 'RecentlyChilled')
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
      damageClass: DamageClass.Ice,
      atkMsg: 'You sunk cold fangs into %0!',
      defMsg: '%0 sunk cold fangs into you!',
    });
  }
}
