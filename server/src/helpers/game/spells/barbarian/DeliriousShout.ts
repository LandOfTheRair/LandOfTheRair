import { ICharacter, SpellCastArgs } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class DeliriousShout extends Spell {
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

    if (enemies.length === 0) return;

    this.game.messageHelper.sendLogMessageToRadius(caster, 8, {
      message: `${caster.name} lets out a delirious shout!`,
    });

    enemies.forEach((enemy) => {
      this.game.effectHelper.addEffect(enemy, caster, 'DeliriousShout', {
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
