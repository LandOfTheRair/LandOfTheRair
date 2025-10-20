import { sample } from 'lodash';

import { traitLevelValue } from '@lotr/content';
import { worldMapStateGetForCharacter } from '@lotr/core';
import type { ICharacter, IStatusEffect } from '@lotr/interfaces';
import { DamageClass, SoundEffect } from '@lotr/interfaces';
import { Song } from './Song';

export class TranquilTrillSong extends Song {
  public override create(char: ICharacter, effect: IStatusEffect) {
    this.sendMessage(char, { message: 'You begin singing a tranquil trill!' });
  }

  override tick(char: ICharacter, effect: IStatusEffect) {
    super.tick(char, effect);

    const allies =
      worldMapStateGetForCharacter(char)?.getAllAlliesInRange(char, 4) ?? [];
    if (allies.length === 0) return;

    const numHeals = 1 + traitLevelValue(char, 'SoothingTranquility');

    for (let i = 0; i < numHeals; i++) {
      const target = sample(allies) as ICharacter;
      if (target.hp.current === target.hp.maximum) continue;

      this.game.combatHelper.magicalAttack(char, target, {
        atkMsg: 'Your tranquility reaches %0!',
        defMsg: 'You feel at peace by the tranquil trill!',
        sfx: SoundEffect.SpellHeal,
        damage: -effect.effectInfo.potency,
        damageClass: DamageClass.Heal,
      });
    }
  }
}
