import { ICharacter, SoundEffect, SpellCastArgs } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class FireMist extends Spell {

  override cast(caster: ICharacter | null, target: ICharacter | null, spellCastArgs: SpellCastArgs): void {
    const center = target ? target : { x: spellCastArgs.x ?? 0, y: spellCastArgs.y ?? 0, map: spellCastArgs.map ?? '' };

    this.game.messageHelper.sendLogMessageToRadius(center, 8, {
      message: 'You see a cloud of smoke form.',
      sfx: SoundEffect.SpellAOEFire
    });
  }

}
