
import { sample } from 'lodash';

import { DamageClass, ICharacter, IStatusEffect } from '../../../../../interfaces';
import { Song } from './Song';

export class DeadlyDirgeSong extends Song {

  public override create(char: ICharacter, effect: IStatusEffect) {
    this.sendMessage(char, { message: 'You begin singing a deadly dirge!' });
  }

  override tick(char: ICharacter, effect: IStatusEffect) {
    super.tick(char, effect);

    const enemies = this.game.worldManager.getMapStateForCharacter(char).getAllHostilesWithoutVisibilityTo(char, 4);
    const numAttacks = 1;

    for (let i = 0; i < numAttacks; i++) {
      this.game.damageHelperMagic.magicalAttack(char, sample(enemies), {
        atkMsg: 'Your deadly dirge pierces %0!',
        defMsg: '%0 is singing a deadly dirge!',
        damage: effect.effectInfo.potency,
        damageClass: DamageClass.Sonic
      });
    }
  }

}
