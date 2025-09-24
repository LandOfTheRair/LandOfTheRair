import {
  DamageClass,
  distanceFrom,
  ICharacter,
  Stat,
} from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class DrainBiteWeak extends SpellCommand {
  override aliases = ['drainbiteweak'];
  override requiresLearn = true;

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return distanceFrom(caster, target) === 0;
  }

  override mpCost(): number {
    return 0;
  }

  override use(executor: ICharacter, target: ICharacter) {
    if (this.game.characterHelper.isPlayer(executor)) return;

    const damage = this.game.diceRollerHelper.diceRoll(
      2,
      this.game.characterHelper.getStat(executor, Stat.STR),
    );

    this.game.combatHelper.magicalAttack(executor, target, {
      damage,
      damageClass: DamageClass.Physical,
      atkMsg: 'You bit %0!',
      defMsg: '%0 bit you!',
    });

    this.game.spellManager.castSpell('Drain', executor, target, {
      potency: 25,
      chance: 100,
    });
  }
}
