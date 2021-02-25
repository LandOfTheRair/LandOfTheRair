import { Parser } from 'muud';

import { Game } from '../../../../helpers';
import { GameServerResponse, IAIBehavior, INPC, IPlayer, ItemSlot, IUpgraderBehavior } from '../../../../interfaces';

export class UpgraderBehavior implements IAIBehavior {

  init(game: Game, npc: INPC, parser: Parser, behavior: IUpgraderBehavior) {

    parser.addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async ({ env }) => {
        const player = env?.player;
        if (!player) return 'You do not exist.';

        if (game.directionHelper.distFrom(player, npc) > 0) return 'Please come closer.';

        env?.callbacks.emit({
          type: GameServerResponse.SendConfirm,
          title: 'Upgrade Item?',
          content: 'Would you like to UPGRADE your item?',
          extraData: { npcSprite: npc.sprite, okText: 'Yes, upgrade!', cancelText: 'No, not now' },
          okAction: { command: '!privatesay', args: `${npc.uuid}, upgrade` }
        });

        return 'Would you like to UPGRADE your items?';
      });

    parser.addCommand('upgrade')
      .setSyntax(['upgrade'])
      .setLogic(async ({ env }) => {
        const player: IPlayer = env?.player;
        if (!player) return 'You do not exist.';

        if (game.directionHelper.distFrom(player, npc) > 0) return 'Please come closer.';

        const rightHand = player.items.equipment[ItemSlot.RightHand];
        if (!rightHand) return 'Your must hold an item to upgrade in your right hand!';

        const leftHand = player.items.equipment[ItemSlot.LeftHand];
        if (!leftHand) return 'Your left hand must have an upgrade material!';

        if (!game.itemHelper.isOwnedBy(player, rightHand)) return 'You do not own that item!';
        if (!game.itemHelper.isOwnedBy(player, leftHand)) return 'You do not own that material!';
        if (!game.itemHelper.canUpgradeItem(rightHand)) return 'I cannot upgrade that item for you!';
        if (!game.itemHelper.canUseItemForUpgrade(leftHand)) return 'That item cannot be used as an upgrade!';

        game.itemHelper.upgradeItem(rightHand, leftHand.name, true);
        game.characterHelper.setLeftHand(player, undefined);

        return 'Your item is upgraded!';
      });
  }

  tick() {}
}
