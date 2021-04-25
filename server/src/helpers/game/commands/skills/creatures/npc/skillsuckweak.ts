
import { random, sample } from 'lodash';

import { DamageClass, ICharacter, IPlayer, Stat } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class SkillSuckWeak extends SpellCommand {

  override aliases = ['skillsuckweak'];
  override requiresLearn = true;

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return this.game.directionHelper.distFrom(caster, target) === 0;
  }

  override use(executor: ICharacter, target: ICharacter) {
    if (this.game.characterHelper.isPlayer(executor)) return;

    const damage = this.game.diceRollerHelper.diceRoll(2, this.game.characterHelper.getStat(executor, Stat.STR));

    if (this.game.characterHelper.isPlayer(target)) {
      this.game.playerHelper.loseExp(target as IPlayer, random(500, 2500));
      this.game.playerHelper.loseSkill(target as IPlayer, sample(Object.keys(target.skills)), random(5, 10));
    }

    this.game.combatHelper.dealDamage(executor, target, {
      damage,
      damageClass: DamageClass.Physical,
      attackerDamageMessage: 'You sucked knowledge from %0!',
      defenderDamageMessage: '%0 sucked away your knowledge!'
    });
  }
}
