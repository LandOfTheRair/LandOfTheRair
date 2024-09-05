import {
  DamageClass,
  distanceFrom,
  ICharacter,
  Stat,
} from '../../../../../../../interfaces';
import { SpellCommand } from '../../../../../../../models/macro';

export class ChillBiteFrostDragon extends SpellCommand {
  override aliases = ['chillbitefrostdragon'];
  override requiresLearn = true;

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return (
      distanceFrom(caster, target) === 0 &&
      !this.game.effectHelper.hasEffect(target, 'Frosted') &&
      !this.game.effectHelper.hasEffect(target, 'RecentlyFrosted')
    );
  }

  override mpCost(): number {
    return 0;
  }

  override use(executor: ICharacter, target: ICharacter) {
    if (this.game.characterHelper.isPlayer(executor)) return;

    const damage = this.game.diceRollerHelper.diceRoll(
      15,
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
