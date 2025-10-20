import { get } from 'lodash';

import { MacroCommand } from '@lotr/core';
import type { ICharacter, IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { GameServerResponse } from '@lotr/interfaces';

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

    let displayValue: ICharacter | undefined = target;
    if (drill) {
      displayValue = get(target, drill, undefined);
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
