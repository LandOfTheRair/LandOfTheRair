import { Allegiance, Hostility, ICharacter, INPC, SpellCastArgs } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Fear extends Spell {

  override getDuration(caster: ICharacter | null) {
    return caster ? 10 : 5;
  }

  override cast(caster: ICharacter | null, target: ICharacter | null, spellCastArgs: SpellCastArgs): void {
    if (!target) return;
    if ((target as INPC).hostility === Hostility.Never) return;
    if ((target as INPC).allegiance === Allegiance.NaturalResource) return;

    const hasUnshakeable = this.game.effectHelper.hasEffect(target, 'Unshakeable');
    if (hasUnshakeable) return;

    this.game.effectHelper.addEffect(target, target, 'Fear', {
      effect: {
        duration: 10
      }
    });
  }

}
