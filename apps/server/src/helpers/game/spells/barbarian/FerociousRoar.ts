import type { ICharacter, SpellCastArgs } from '@lotr/interfaces';
import { Spell } from '../../../../models/world/Spell';

export class FerociousRoar extends Spell {
  override cast(
    caster: ICharacter | null,
    target: ICharacter | null,
    spellCastArgs: SpellCastArgs,
  ): void {
    if (!caster) return;

    const enemies = this.game.targettingHelper.getPossibleAOETargets(
      caster,
      caster,
      4,
      6,
    );

    const allies = this.game.targettingHelper.getPossibleFriendlyAOETargets(
      caster,
      caster,
      4,
      6,
    );

    this.game.messageHelper.sendLogMessageToRadius(caster, 8, {
      message: `${caster.name} lets out a ferocious roar!`,
    });

    enemies.forEach((enemy) => {
      this.game.effectHelper.addEffect(enemy, caster, 'FerociousRoarDread', {
        effect: {
          duration: 300,
          extra: {
            potency: spellCastArgs.potency,
          },
        },
      });
    });

    allies.forEach((ally) => {
      this.game.effectHelper.addEffect(ally, caster, 'FerociousRoarVigor', {
        effect: {
          duration: 300,
          extra: {
            potency: spellCastArgs.potency,
          },
        },
      });
    });
  }
}
