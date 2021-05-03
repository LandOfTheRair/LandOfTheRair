

import { clamp } from 'lodash';

import { ICharacter, Stat } from '../../../../../../../interfaces';
import { SpellCommand } from '../../../../../../../models/macro';

export class GhostWail extends SpellCommand {

  override aliases = ['ghostwail'];
  override requiresLearn = true;

  override mpCost(char: ICharacter) {
    return char.mp.maximum / 2;
  }

  override canUse(char: ICharacter, target: ICharacter) {
    const nearby = this.game.worldManager.getMapStateForCharacter(char)?.getAllPlayersInRange(char, 10);
    return char.mp.current > this.mpCost(char) && nearby.length > 0;
  }

  override use(executor: ICharacter, target: ICharacter) {
    if (this.game.characterHelper.isPlayer(executor)) return;

    this.game.messageHelper.sendLogMessageToRadius(executor, 10, { message: 'You hear a terrifying wail!' });
    this.game.worldManager.getMapStateForCharacter(executor)?.getAllPlayersInRange(executor, 10).forEach(char => {

      const successChance = clamp((this.game.characterHelper.getStat(char, Stat.WIL) - 23) + 4, 0, 8) * 12.5;
      if (this.game.diceRollerHelper.XInOneHundred(successChance)) {
        this.game.messageHelper.sendSimpleMessage(char, 'You resisted the ghostly wail!');
        return;
      }

      this.game.effectHelper.addEffect(char, executor, 'Stun', { effect: {
        duration: 5,
        extra: { disableMessages: true, disableRecently: true } }
      });

      this.game.effectHelper.addEffect(char, executor, 'Chilled', { effect: {
        duration: 25,
        extra: { disableMessages: true, disableRecently: true } }
      });

      this.game.characterHelper.dropHands(char);
    });
  }
}
