import { ICharacter, ItemSlot, SpellCastArgs } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Ragerang extends Spell {

  override cast(caster: ICharacter | null, target: ICharacter | null, spellCastArgs: SpellCastArgs): void {

    if (!caster || !target) return;

    const ragerangData = this.game.spellManager.getSpellData('Ragerang');
    const ragerangPotency = this.game.spellManager.getPotency(caster, caster, ragerangData);

    this.game.combatHelper.physicalAttack(caster, target, {
      isThrow: true,
      throwHand: ItemSlot.RightHand,
      attackRange: 4,
      damageMult: ragerangPotency
    });
  }

}
