import { traitLevelValue } from '@lotr/content';
import type { ICharacter } from '@lotr/interfaces';
import { SoundEffect, VisualEffect } from '@lotr/interfaces';
import { Spell } from '../../../../models/world/Spell';

export class FireMist extends Spell {
  override showAoEVFX(
    caster: ICharacter | undefined,
    x: number,
    y: number,
    map: string,
  ): void {
    const center = { x, y, map };

    const radius = 1 + (caster ? traitLevelValue(caster, 'FireMistWiden') : 0);

    this.game.messageHelper.sendLogMessageToRadius(center, 8, {
      message: 'You see a cloud of smoke form.',
      sfx: SoundEffect.SpellAOEFire,
      vfx: VisualEffect.FireMist,
      vfxTiles: this.game.messageHelper.getVFXTilesForTile(center, radius),
      vfxTimeout: 2000,
    });
  }
}
