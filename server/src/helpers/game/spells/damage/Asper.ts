import { ICharacter, SpellCastArgs } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Asper extends Spell {

  override cast(caster: ICharacter | null, target: ICharacter | null, spellCastArgs: SpellCastArgs): void {
    if (!caster || !target) return;

    let totalDrain = Math.min(spellCastArgs.potency, target.mp.current);
    if (target.mp.current - totalDrain <= 0) totalDrain = target.mp.current - 1;

    if (totalDrain <= 0) {
      return this.sendMessage(caster, { message: `${target.name} has no mana to drain!` });
    }

    this.sendMessage(target, { message: 'You feel your mana slipping away!' });
    this.sendMessage(caster, { message: `You drained ${totalDrain} MP from ${target.name}!` });

    this.game.characterHelper.mana(caster, totalDrain);
    this.game.characterHelper.manaDamage(target, totalDrain);

    this.game.characterHelper.addAgro(caster, target, totalDrain);
  }

}
