import { MacroCommand } from '@lotr/core';
import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';

export class GMRemoveEffect extends MacroCommand {
  override aliases = ['@removeeffect', '@remeff', '@re'];
  override isGMCommand = true;
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const [creature, effect] = args.arrayArgs;

    const target = this.game.targettingHelper.getFirstPossibleTargetInViewRange(
      player,
      creature,
    );
    if (!target) return this.youDontSeeThatPerson(player, creature);

    const effectData = target.effects._hash[effect];
    if (!effectData) {
      return this.sendMessage(player, 'Could not find that effect.');
    }

    this.game.effectHelper.removeEffect(target, effectData);
    delete target.effects._hash[effect];
  }
}
