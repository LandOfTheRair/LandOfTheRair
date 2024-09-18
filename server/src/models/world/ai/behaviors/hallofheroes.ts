import { Parser } from 'muud';

import { Game } from '../../../../helpers';
import {
  IAIBehavior,
  IHallOfHeroesBehavior,
  INPC,
  ItemSlot,
} from '../../../../interfaces';

export class HallOfHeroesBehavior implements IAIBehavior {
  init(game: Game, npc: INPC, parser: Parser, behavior: IHallOfHeroesBehavior) {
    const { body, leftHand, rightHand } = behavior;

    if (body) {
      game.characterHelper.setEquipmentSlot(
        npc,
        ItemSlot.Armor,
        game.itemCreator.getSimpleItem(body),
      );
    }

    if (leftHand) {
      game.characterHelper.setEquipmentSlot(
        npc,
        ItemSlot.LeftHand,
        game.itemCreator.getSimpleItem(leftHand),
      );
    }

    if (rightHand) {
      game.characterHelper.setEquipmentSlot(
        npc,
        ItemSlot.RightHand,
        game.itemCreator.getSimpleItem(rightHand),
      );
    }

    parser
      .addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async () => behavior.message);
  }

  tick() {}
}
