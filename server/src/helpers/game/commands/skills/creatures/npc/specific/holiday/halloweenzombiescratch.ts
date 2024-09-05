import {
  distanceFrom,
  ICharacter,
  INPC,
} from '../../../../../../../../interfaces';
import { SpellCommand } from '../../../../../../../../models/macro';

export class HalloweenZombieScratch extends SpellCommand {
  override aliases = ['halloweenzombiescratch'];
  override requiresLearn = true;

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return (
      distanceFrom(caster, target) === 0 &&
      !this.game.effectHelper.hasEffect(target, 'Dangerous') &&
      !this.game.effectHelper.hasEffect(target, 'ZombieScratch') &&
      (target as INPC).monsterClass === 'Humanoid' &&
      !this.game.characterHelper.isPlayer(target) &&
      !(target as INPC).owner
    );
  }

  override mpCost(): number {
    return 0;
  }

  override use(executor: ICharacter, target: ICharacter) {
    if (this.game.characterHelper.isPlayer(executor)) return;

    this.game.effectHelper.addEffect(target, executor, 'ZombieScratch');
  }
}
