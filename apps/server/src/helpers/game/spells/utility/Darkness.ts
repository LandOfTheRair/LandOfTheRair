import type { ICharacter, IPlayer, SpellCastArgs } from '@lotr/interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Darkness extends Spell {
  override cast(
    caster: ICharacter | null,
    target: ICharacter | null,
    spellCastArgs: SpellCastArgs,
  ): void {
    // enemies need this bypass because of how their targetting works
    if (
      target &&
      caster &&
      this.game.characterHelper.isPlayer(caster as IPlayer)
    ) {
return;
}

    const x = spellCastArgs.x ?? target?.x ?? null;
    const y = spellCastArgs.y ?? target?.y ?? null;
    const map = spellCastArgs.map ?? target?.map ?? null;

    if (!x || !y || !map) return;

    const basePotency = spellCastArgs.potency ?? 10;
    const duration = basePotency * 1000;

    if (caster) {
      this.sendMessage(caster, {
        message: 'You cloak the area in a veil of darkness.',
      });
    }

    const radius =
      spellCastArgs.range +
      (caster
        ? this.game.traitHelper.traitLevelValue(caster, 'DarknessWiden')
        : 0);
    this.game.darknessHelper.createDarkness(
      map,
      x,
      y,
      radius,
      Date.now() + duration,
    );
  }
}
