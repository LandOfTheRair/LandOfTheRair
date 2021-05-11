

import { sample } from 'lodash';

import { ICharacter } from '../../../../../../../../interfaces';
import { SpellCommand } from '../../../../../../../../models/macro';

export class ChristmasPresentElfDropPresent extends SpellCommand {

  override aliases = ['christmaspresentelfdroppresent'];
  override requiresLearn = true;

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return true;
  }

  override use(executor: ICharacter, target: ICharacter) {
    if (this.game.characterHelper.isPlayer(executor)) return;

    this.game.messageHelper.sendLogMessageToRadius(executor, 16, { from: executor.name, message: 'Whoops, dropped a present!' });

    const item = sample([
      'Christmas Gift - Red',
      'Christmas Gift - Blue',
      'Christmas Gift - Yellow',
      'Christmas Gift - Green',
      'Christmas Gift - Rainbow'
    ]) as string;

    const created = this.game.itemCreator.getSimpleItem(item);
    this.game.worldManager.getMapStateForCharacter(executor)?.addItemToGround(executor.x, executor.y, created);
  }
}
