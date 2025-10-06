import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { MacroCommand } from '../../../../models/macro';

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

    const effectData = player.effects._hash[effect];
    if (!effectData) {
      return this.sendMessage(player, 'Could not find that effect.');
    }

    this.game.effectHelper.removeEffect(player, effectData);
    delete player.effects._hash[effect];
  }
}
