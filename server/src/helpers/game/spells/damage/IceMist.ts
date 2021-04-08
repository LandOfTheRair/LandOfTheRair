import { ICharacter, SoundEffect, SpellCastArgs } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class IceMist extends Spell {

  override cast(caster: ICharacter | null, target: ICharacter | null, spellCastArgs: SpellCastArgs): void {
    if (!target) return;
    this.game.messageHelper.sendLogMessageToRadius(target, 5, { message: 'You see a dense fog form.', sfx: SoundEffect.SpellAOEFrost });
  }

}
