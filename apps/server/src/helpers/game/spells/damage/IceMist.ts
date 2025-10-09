import { traitLevelValue } from '@lotr/content';
import type { ICharacter, SpellCastArgs } from '@lotr/interfaces';
import { SoundEffect, VisualEffect } from '@lotr/interfaces';
import { Spell } from '../../../../models/world/Spell';

export class IceMist extends Spell {
  override cast(
    caster: ICharacter | undefined,
    target: ICharacter | undefined,
    spellCastArgs: SpellCastArgs,
  ): void {
    if (target) return;

    const center = target
      ? target
      : {
          x: spellCastArgs.x ?? 0,
          y: spellCastArgs.y ?? 0,
          map: spellCastArgs.map ?? '',
        };

    const radius =
      spellCastArgs.range +
      (caster ? traitLevelValue(caster, 'IceMistWiden') : 0);

    this.game.messageHelper.sendLogMessageToRadius(center, 8, {
      message: 'You see a dense fog form.',
      sfx: SoundEffect.SpellAOEFrost,
      vfx: VisualEffect.IceMist,
      vfxTiles: this.game.messageHelper.getVFXTilesForTile(center, radius),
      vfxTimeout: 2000,
    });
  }
}
