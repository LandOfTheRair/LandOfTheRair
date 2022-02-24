import { ICharacter, SpellCastArgs } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class MadDash extends Spell {

  override cast(caster: ICharacter | null, target: ICharacter | null, spellCastArgs: SpellCastArgs): void {

    if (!caster || !target) return;

    const maddashData = this.game.spellManager.getSpellData('MadDash');
    const maddashPotency = this.game.spellManager.getPotency(caster, caster, maddashData);

    this.game.movementHelper.moveTowards(caster, target);

    this.game.combatHelper.physicalAttack(caster, target, {
      damageMult: maddashPotency
    });

    this.game.characterHelper.mana(caster, 30);
  }

}
