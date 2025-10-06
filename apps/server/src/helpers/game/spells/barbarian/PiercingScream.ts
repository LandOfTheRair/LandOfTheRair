import type { ICharacter, SpellCastArgs } from '@lotr/interfaces';
import { SoundEffect, Stat } from '@lotr/interfaces';
import { Spell } from '../../../../models/world/Spell';

export class PiercingScream extends Spell {
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
      message: `${caster.name} lets out a piercing scream!`,
      sfx: SoundEffect.SpellSpecialBerserk,
    });

    enemies.forEach((enemy) => {
      this.game.effectHelper.addEffect(enemy, caster, 'PiercingScream', {
        effect: {
          duration: 3 + this.game.characterHelper.getStat(caster, Stat.STR),
          extra: {
            potency: spellCastArgs.potency,
          },
        },
      });
    });
  }
}
