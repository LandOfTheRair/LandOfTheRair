import { worldMapStateGetForCharacter } from '@lotr/core';
import type { ICharacter, SpellCastArgs } from '@lotr/interfaces';
import { Spell } from '../../../../models/world/Spell';

export class MockingShout extends Spell {
  override cast(
    caster: ICharacter | undefined,
    target: ICharacter | undefined,
    spellCastArgs: SpellCastArgs,
  ): void {
    if (!caster) return;

    this.game.messageHelper.sendSimpleMessage(caster, 'You mock your foes!');

    const state = worldMapStateGetForCharacter(caster);
    if (!state) return;

    state
      .getAllHostilesWithoutVisibilityTo(caster, 4)
      .forEach((foundTarget) => {
        this.game.messageHelper.sendSimpleMessage(
          foundTarget,
          `${caster.name} is mocking you!`,
        );
        this.game.characterHelper.addAgro(
          caster,
          foundTarget,
          this.game.spellManager.getPotency(
            caster,
            target,
            spellCastArgs.spellData,
          ),
        );
      });
  }
}
