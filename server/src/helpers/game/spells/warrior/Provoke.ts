import { ICharacter, MessageType, SpellCastArgs } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Provoke extends Spell {
  override cast(
    caster: ICharacter | null,
    target: ICharacter | null,
    spellCastArgs: SpellCastArgs,
  ): void {
    if (!caster || !target) return;

    this.game.messageHelper.sendSimpleMessage(
      caster,
      `You provoked ${target.name}!`,
    );

    this.game.messageHelper.sendLogMessageToPlayer(
      target,
      {
        message: `${caster.name} provoked you!`,
        setTarget: caster.uuid,
      },
      [MessageType.Miscellaneous],
    );

    this.game.characterHelper.addAgro(
      caster,
      target,
      this.game.spellManager.getPotency(
        caster,
        target,
        spellCastArgs.spellData,
      ),
    );
  }
}
