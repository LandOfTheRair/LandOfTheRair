import { merge } from 'lodash';

import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { MacroCommand } from '../../../../models/macro';

export class GMModCreature extends MacroCommand {
  override aliases = ['@modcreature', '@modc'];
  override isGMCommand = true;
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const [creature, ...drill] = args.arrayArgs;

    const target = this.game.targettingHelper.getFirstPossibleTargetInViewRange(
      player,
      creature,
    );
    if (!target) return this.youDontSeeThatPerson(player, creature);

    const formattedArgs = this.game.messageHelper.getMergeObjectFromArgs(
      drill.join(' '),
    );
    merge(target, formattedArgs);

    this.game.characterHelper.recalculateEverything(target);

    this.sendMessage(
      player,
      `Modified ${target.name}: ${JSON.stringify(formattedArgs)}`,
    );
  }
}
