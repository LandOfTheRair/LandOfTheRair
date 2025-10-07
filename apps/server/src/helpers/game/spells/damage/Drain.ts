import { heal, takeDamage } from '@lotr/characters';
import type { ICharacter, SpellCastArgs } from '@lotr/interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Drain extends Spell {
  override cast(
    caster: ICharacter | null,
    target: ICharacter | null,
    spellCastArgs: SpellCastArgs,
  ): void {
    if (!caster || !target) return;

    let totalDrain = Math.min(spellCastArgs.potency, target.hp.current);
    if (target.hp.current - totalDrain <= 0) totalDrain = target.hp.current - 1;

    if (totalDrain <= 0) {
      return this.sendMessage(caster, {
        message: `${target.name} has no life force to drain!`,
      });
    }

    this.sendMessage(target, {
      message: 'You feel your life force slipping away!',
    });
    this.sendMessage(caster, {
      message: `You drained ${totalDrain} HP from ${target.name}!`,
    });

    heal(caster, totalDrain);
    takeDamage(target, totalDrain);

    this.game.characterHelper.addAgro(caster, target, totalDrain);
  }
}
