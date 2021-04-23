import { DamageArgs, ICharacter, IStatusEffect } from '../../../../../interfaces';
import { Effect } from '../../../../../models';

export class Song extends Effect {

  // add a generic song buff
  override apply(char: ICharacter) {
    this.game.effectHelper.addEffect(char, char, 'Singing');
  }

  // remove the buff
  override unapply(char: ICharacter) {
    this.game.effectHelper.removeEffectByName(char, 'Singing');
  }

  public override tick(char: ICharacter, effect: IStatusEffect) {
    super.tick(char, effect);

    this.game.characterHelper.manaDamage(char, 5);
    if (char.mp.current <= 0) {
      this.sendMessage(char, { message: 'You run out of breath!' });
      this.game.effectHelper.removeEffect(char, effect);
    }

    if (this.game.effectHelper.hasEffect(char, 'Hidden')) {
      this.sendMessage(char, { message: 'Your singing gives your position away!' });
      this.game.effectHelper.removeEffectByName(char, 'Hidden');
    }
  }

  public override outgoing(
    effect: IStatusEffect,
    char: ICharacter,
    target: ICharacter,
    damageArgs: DamageArgs
  ): void {
    const encoreBoost = this.game.traitHelper.traitLevelValue(char, 'OffensiveEncore');

    if (!encoreBoost) return;
    this.game.characterHelper.mana(char, encoreBoost);
  }

}
