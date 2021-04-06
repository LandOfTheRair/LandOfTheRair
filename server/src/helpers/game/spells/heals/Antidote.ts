import { ICharacter, SpellCastArgs } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Antidote extends Spell {

  override cast(caster: ICharacter | null, target: ICharacter | null, spellCastArgs: SpellCastArgs): void {
    if (!target) return;
    const hasPoison = this.game.effectHelper.hasEffect(target, 'Poison');
    const hasDisease = this.game.effectHelper.hasEffect(target, 'Disease');

    if (!hasPoison && !hasDisease && caster) {
      this.sendMessage(caster, { message: `${target.name} is not poisoned or diseased.` });
      return;
    }

    if (hasPoison) this.game.effectHelper.removeEffectByName(target, 'Poison');
    if (hasDisease) this.game.effectHelper.removeEffectByName(target, 'Disease');
  }

}
