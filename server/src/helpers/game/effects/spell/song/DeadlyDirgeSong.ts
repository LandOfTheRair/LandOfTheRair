import { sample } from 'lodash';

import {
  DamageClass,
  distanceFrom,
  ICharacter,
  IStatusEffect,
} from '../../../../../interfaces';
import { Song } from './Song';

export class DeadlyDirgeSong extends Song {
  public override create(char: ICharacter, effect: IStatusEffect) {
    this.sendMessage(char, { message: 'You begin singing a deadly dirge!' });
  }

  override tick(char: ICharacter, effect: IStatusEffect) {
    super.tick(char, effect);

    let enemies = (
      this.game.worldManager
        .getMapStateForCharacter(char)
        ?.getAllHostilesWithoutVisibilityTo(char, 4) ?? []
    ).filter(
      (enemy) =>
        this.game.movementHelper.numStepsTo(char, enemy) ===
        distanceFrom(char, enemy),
    );

    if (enemies.length === 0) return;

    const numAttacks =
      1 + this.game.traitHelper.traitLevelValue(char, 'DirgeOfCerberus');

    for (let i = 0; i < numAttacks; i++) {
      this.game.damageHelperMagic.magicalAttack(
        char,
        sample(enemies) as ICharacter,
        {
          atkMsg: 'Your deadly dirge pierces %0!',
          defMsg: '%0 is singing a deadly dirge!',
          damage: effect.effectInfo.potency,
          damageClass: DamageClass.Sonic,
          attackNum: i,
        },
      );

      // Remove anybody who died after the last attack
      enemies = enemies.filter(
        (enemy) => !this.game.characterHelper.isDead(enemy),
      );
      if (enemies.length === 0) return;
    }
  }
}
