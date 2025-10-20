import { random, sample } from 'lodash';

import { getStat, isPlayer } from '@lotr/characters';
import { SpellCommand } from '@lotr/core';
import type { ICharacter, IPlayer, Skill } from '@lotr/interfaces';
import { DamageClass, Stat } from '@lotr/interfaces';
import { diceRoll } from '@lotr/rng';
import { distanceFrom } from '@lotr/shared';

export class SkillSuckWeak extends SpellCommand {
  override aliases = ['skillsuckweak'];
  override requiresLearn = true;

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return distanceFrom(caster, target) === 0;
  }

  override mpCost(): number {
    return 0;
  }

  override use(executor: ICharacter, target: ICharacter) {
    if (isPlayer(executor)) return;

    const damage = diceRoll(2, getStat(executor, Stat.STR));

    if (isPlayer(target)) {
      this.game.playerHelper.loseExp(target as IPlayer, random(500, 2500));
      this.game.playerHelper.loseSkill(
        target as IPlayer,
        sample(Object.keys(target.skills)) as Skill,
        random(5, 10),
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
