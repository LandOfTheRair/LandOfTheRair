import { ICharacter, SpellCastArgs } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Vision extends Spell {

  override cast(caster: ICharacter | null, target: ICharacter | null, spellCastArgs: SpellCastArgs): void {
    if (!target) return;
    const hasBlind = this.game.effectHelper.hasEffect(target, 'Blind');

    if (!hasBlind && caster) {
      this.sendMessage(caster, { message: `${target.name} is not blinded.` });
      return;
    }

    this.game.effectHelper.removeEffectByName(target, 'Blind');
  }

}
