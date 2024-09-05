import { random, sample } from 'lodash';

import {
  DamageClass,
  distanceFrom,
  ICharacter,
  IPlayer,
  Skill,
  Stat,
} from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class SkillSuckMedium extends SpellCommand {
  override aliases = ['skillsuckmedium'];
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
      4,
      this.game.characterHelper.getStat(executor, Stat.STR),
    );

    if (this.game.characterHelper.isPlayer(target)) {
      this.game.playerHelper.loseExp(target as IPlayer, random(9500, 12500));
      this.game.playerHelper.loseSkill(
        target as IPlayer,
        sample(Object.keys(target.skills)) as Skill,
        random(20, 30),
      );
    }

    this.game.combatHelper.magicalAttack(executor, target, {
      damage,
      damageClass: DamageClass.Physical,
      atkMsg: 'You sucked knowledge from %0!',
      defMsg: '%0 sucked away your knowledge!',
    });
  }
}
