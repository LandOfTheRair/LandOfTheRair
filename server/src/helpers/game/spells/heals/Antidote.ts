import { ICharacter, SpellCastArgs } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Antidote extends Spell {

  override cast(caster: ICharacter | null, target: ICharacter | null, spellCastArgs: SpellCastArgs): void {
    if (!target) return;
    const hasPoison = this.game.effectHelper.hasEffect(target, 'Poison');

    if (!hasPoison && caster) {
      this.sendMessage(caster, { message: `${target.name} is not poisoned.` });
      return;
    }

    this.game.effectHelper.removeEffectByName(target, 'Poison');
  }

}
