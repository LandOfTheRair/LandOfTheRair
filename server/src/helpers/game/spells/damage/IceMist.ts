import { ICharacter, SoundEffect, SpellCastArgs, VisualEffect } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class IceMist extends Spell {

  override cast(caster: ICharacter | null, target: ICharacter | null, spellCastArgs: SpellCastArgs): void {
    const center = target ? target : { x: spellCastArgs.x ?? 0, y: spellCastArgs.y ?? 0, map: spellCastArgs.map ?? '' };

    const radius = spellCastArgs.range + (caster ? this.game.traitHelper.traitLevelValue(caster, 'IceMistWiden') : 0);

    this.game.messageHelper.sendLogMessageToRadius(center, 8, {
      message: 'You see a dense fog form.',
      sfx: SoundEffect.SpellAOEFrost,
      vfx: VisualEffect.IceMist,
      vfxRadius: radius,
      vfxX: center.x,
      vfxY: center.y,
      vfxTimeout: 2000
    });
  }

}
