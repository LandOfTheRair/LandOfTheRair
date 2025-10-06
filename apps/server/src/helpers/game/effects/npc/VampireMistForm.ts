import type { ICharacter, IStatusEffect } from '@lotr/interfaces';
import { Effect } from '../../../../models';

export class VampireMistForm extends Effect {
  public override apply(char: ICharacter) {
    this.game.effectHelper.addEffect(char, char, 'Invulnerable');
    const summonCreatures = [
      'Summoned Vampire Bat',
      'Summoned Vampire Bat',
      'Summoned Vampire Bat',
    ];
    this.game.effectHelper.addEffect(char, char, 'FindFamiliar', {
      effect: { duration: -1, extra: { summonCreatures } },
    });
  }

  public override tick(char: ICharacter, effect: IStatusEffect) {
    super.tick(char, effect);

    this.game.targettingHelper
      .getPossibleAOETargets(char, char, 0)
      .forEach((target) => {
        this.game.commandHandler
          .getSkillRef('Asper')
          .use(char, target, {
            overrideEffect: { name: 'Asper', extra: { potency: 50 } },
          });
        this.game.commandHandler
          .getSkillRef('Disease')
          .use(char, target, {
            overrideEffect: { name: 'Disease', extra: { potency: 50 } },
          });
      });
  }

  public override unapply(char: ICharacter) {
    this.game.effectHelper.removeEffectByName(char, 'Invulnerable');
  }
}
