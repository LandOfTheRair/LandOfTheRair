import { sample } from 'lodash';

import { isPlayer } from '@lotr/characters';
import { SpellCommand, worldMapStateGetForCharacter } from '@lotr/core';
import type { ICharacter } from '@lotr/interfaces';

export class ChristmasPresentElfDropPresent extends SpellCommand {
  override aliases = ['christmaspresentelfdroppresent'];
  override requiresLearn = true;

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return true;
  }

  override mpCost(): number {
    return 0;
  }

  override use(executor: ICharacter, target: ICharacter) {
    if (isPlayer(executor)) return;

    this.game.messageHelper.sendLogMessageToRadius(executor, 16, {
      from: executor.name,
      message: 'Whoops, dropped a present!',
    });

    const item = sample([
      'Christmas Gift - Red',
      'Christmas Gift - Blue',
      'Christmas Gift - Yellow',
      'Christmas Gift - Green',
      'Christmas Gift - Rainbow',
    ]) as string;

    const created = this.game.itemCreator.getSimpleItem(item);
    worldMapStateGetForCharacter(executor)?.addItemToGround(
      executor.x,
      executor.y,
      created,
    );
  }
}
