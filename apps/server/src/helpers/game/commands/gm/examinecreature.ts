import { get } from 'lodash';

import type { ICharacter, IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { GameServerResponse } from '@lotr/interfaces';
import { MacroCommand } from '../../../../models/macro';

export class GMExamineCreature extends MacroCommand {
  override aliases = ['@examinecreature', '@excreature', '@exc'];
  override isGMCommand = true;
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const [creature, drill] = args.arrayArgs;

    const target = this.game.targettingHelper.getFirstPossibleTargetInViewRange(
      player,
      creature,
    );
    if (!target) return this.youDontSeeThatPerson(player, creature);

    let displayValue: ICharacter | null = target;
    if (drill) {
      displayValue = get(target, drill, null);
    }

    this.sendMessage(player, `Examine ${target.name} (${drill || 'all'}):`);
    this.sendMessage(player, '===');
    this.sendMessage(player, `\`${JSON.stringify(displayValue, null, 2)}\``);
    this.sendMessage(player, '===');

    args.callbacks.emit({
      type: GameServerResponse.SendAlert,
      title: `Examine ${target.name} (${drill || 'all'}):`,
      content: JSON.stringify(displayValue, null, 2),
    });
  }
}
