import { traitLevelValue } from '@lotr/content';
import type { ICharacter } from '@lotr/interfaces';
import { SoundEffect, VisualEffect } from '@lotr/interfaces';
import { Spell } from '../../../../models/world/Spell';

export class IceMist extends Spell {
  override showAoEVFX(
    caster: ICharacter | undefined,
    x: number,
    y: number,
    map: string,
  ): void {
    const center = { x, y, map };

    const radius = 1 + (caster ? traitLevelValue(caster, 'IceMistWiden') : 0);

    this.game.messageHelper.sendLogMessageToRadius(center, 8, {
      message: 'You see a dense fog form.',
      sfx: SoundEffect.SpellAOEFrost,
      vfx: VisualEffect.IceMist,
      vfxTiles: this.game.messageHelper.getVFXTilesForTile(center, radius),
      vfxTimeout: 2000,
    });
  }
}
