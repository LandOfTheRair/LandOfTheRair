import {
  DamageClass,
  distanceFrom,
  ICharacter,
} from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class ShredTwentyPercent extends SpellCommand {
  override aliases = ['shredtwentypercent'];
  override requiresLearn = true;

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return (
      distanceFrom(caster, target) <= 0 &&
      target.hp.current > target.hp.maximum * 0.6 &&
      !this.game.effectHelper.hasEffect(target, 'Dangerous')
    );
  }

  override mpCost(): number {
    return 0;
  }

  override use(executor: ICharacter, target: ICharacter) {
    if (this.game.characterHelper.isPlayer(executor)) return;

    const damage = Math.floor(target.hp.maximum / 5);

    this.game.combatHelper.magicalAttack(executor, target, {
      damage,
      damageClass: DamageClass.Sonic,
      atkMsg: 'You shredded the flesh of %0!',
      defMsg: '%0 shreds your flesh!',
    });
  }
}
