import { traitLevelValue } from '@lotr/content';
import type { ICharacter, SpellCastArgs } from '@lotr/interfaces';
import { SoundEffect, VisualEffect } from '@lotr/interfaces';
import { Spell } from '../../../../models/world/Spell';

export class FireMist extends Spell {
  override cast(
    caster: ICharacter | undefined,
    target: ICharacter | undefined,
    spellCastArgs: SpellCastArgs,
  ): void {
    if (target) return;

    const center = {
      x: spellCastArgs.x ?? 0,
      y: spellCastArgs.y ?? 0,
      map: spellCastArgs.map ?? '',
    };

    const radius =
      spellCastArgs.range +
      (caster ? traitLevelValue(caster, 'FireMistWiden') : 0);

    this.game.messageHelper.sendLogMessageToRadius(center, 8, {
      message: 'You see a cloud of smoke form.',
      sfx: SoundEffect.SpellAOEFire,
      vfx: VisualEffect.FireMist,
      vfxRadius: radius,
      vfxX: center.x,
      vfxY: center.y,
      vfxTimeout: 2000,
    });
  }
}
