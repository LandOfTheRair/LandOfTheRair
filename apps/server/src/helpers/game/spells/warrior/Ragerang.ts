import type { ICharacter } from '@lotr/interfaces';
import { ItemSlot } from '@lotr/interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Ragerang extends Spell {
  override cast(
    caster: ICharacter | undefined,
    target: ICharacter | undefined,
  ): void {
    if (!caster || !target) return;

    const ragerangData = this.game.spellManager.getSpellData(
      'Ragerang',
      `RR:${caster?.name}`,
    );
    const ragerangPotency = this.game.spellManager.getPotency(
      caster,
      caster,
      ragerangData,
    );

    this.game.combatHelper.physicalAttack(caster, target, {
      isThrow: true,
      throwHand: ItemSlot.RightHand,
      attackRange: 4,
      damageMult: ragerangPotency,
    });
  }
}
