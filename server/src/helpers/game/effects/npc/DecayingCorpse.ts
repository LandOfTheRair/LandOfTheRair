
import { DamageClass, ICharacter, IStatusEffect } from '../../../../interfaces';
import { Effect } from '../../../../models';

export class DecayingCorpse extends Effect {

  public override unapply(char: ICharacter, effect: IStatusEffect) {
    this.game.damageHelperOnesided.dealOnesidedDamage(char, {
      damage: char.hp.maximum,
      damageClass: DamageClass.Sonic,
      damageMessage: 'You succumbed to the cycle of life.'
    });
  }

}
