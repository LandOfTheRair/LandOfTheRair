

import { ICharacter, Stat } from '../../../../../../../interfaces';
import { SpellCommand } from '../../../../../../../models/macro';

export class DedlaenSpiderImmobilize extends SpellCommand {

  override aliases = ['dedlaenspiderimmobilize'];
  override requiresLearn = true;

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return this.game.directionHelper.distFrom(caster, target) === 0
        && this.game.characterHelper.getStat(target, Stat.STR) < 25
        && !this.game.effectHelper.hasEffect(target, 'Immobilized')
        && !this.game.effectHelper.hasEffect(target, 'RecentlyImmobilized');
  }

  override use(executor: ICharacter, target: ICharacter) {
    if (this.game.characterHelper.isPlayer(executor)) return;

    const duration = Math.floor(Math.max(2, 20 - this.game.characterHelper.getStat(target, Stat.STR)));
    this.game.effectHelper.addEffect(target, executor, 'Immobilized', { effect: { duration } });

    this.game.messageHelper.sendSimpleMessage(target, 'You are stuck in a web!');
  }
}
