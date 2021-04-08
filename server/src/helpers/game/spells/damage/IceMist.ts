import { ICharacter, SoundEffect, SpellCastArgs } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class IceMist extends Spell {

  override cast(caster: ICharacter | null, target: ICharacter | null, spellCastArgs: SpellCastArgs): void {
    const center = target ? target : { x: spellCastArgs.x ?? 0, y: spellCastArgs.y ?? 0, map: spellCastArgs.map ?? '' };

    this.game.messageHelper.sendLogMessageToRadius(center, 8, {
      message: 'You see a dense fog form.',
      sfx: SoundEffect.SpellAOEFrost
    });
  }

}
