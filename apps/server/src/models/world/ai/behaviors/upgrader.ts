import type { Parser } from 'muud';

import type {
  IAIBehavior,
  INPC,
  IPlayer,
  IUpgraderBehavior,
} from '@lotr/interfaces';
import { GameServerResponse, ItemSlot } from '@lotr/interfaces';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { Game } from '../../../../helpers';

import { itemPropertiesGet, itemPropertyGet } from '@lotr/content';
import { distanceFrom } from '@lotr/shared';

export class UpgraderBehavior implements IAIBehavior {
  init(game: Game, npc: INPC, parser: Parser, behavior: IUpgraderBehavior) {
    parser
      .addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async ({ env }) => {
        const player = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 0) return 'Please come closer.';

        const rightHand = player.items.equipment[ItemSlot.RightHand];

        const {
          canUpgradeWith,
          stats,
          requirements: rightRequirements,
        } = itemPropertiesGet(rightHand, [
          'stats',
          'canUpgradeWith',
          'requirements',
        ]);

        if (canUpgradeWith) {
          let message = '';

          if (!stats) message = 'This upgrade doe not seem to do anything.';

          if (stats) {
            message = `This upgrade increases the following stats: ${Object.keys(
              stats,
            )
              .map((x) => x.toUpperCase())
              .join(', ')}`;
          }

          if (rightRequirements?.level) {
            message = `${message} You'll need to be level ${rightRequirements.level} to encrust this gem.`;

            if (rightRequirements.level > player.level) {
              message = `${message} You aren't strong enough to use this gem yet!`;
            }
          }

          env?.callbacks.emit({
            type: GameServerResponse.SendAlert,
            title: 'Upgrade Appraisal',
            content: message,
            extraData: { npcSprite: npc.sprite },
          });

          return message;
        }

        env?.callbacks.emit({
          type: GameServerResponse.SendConfirm,
          title: 'Upgrade Item?',
          content: 'Would you like to UPGRADE your item?',
          extraData: {
            npcSprite: npc.sprite,
            okText: 'Yes, upgrade!',
            cancelText: 'No, not now',
          },
          okAction: { command: '!privatesay', args: `${npc.uuid}, upgrade` },
        });

        return 'Would you like to UPGRADE your item?';
      });

    parser
      .addCommand('upgrade')
      .setSyntax(['upgrade'])
      .setLogic(async ({ env }) => {
        const player: IPlayer = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 0) return 'Please come closer.';

        const rightHand = player.items.equipment[ItemSlot.RightHand];
        if (!rightHand) {
          return 'Your must hold an item to upgrade in your right hand!';
        }

        const leftHand = player.items.equipment[ItemSlot.LeftHand];
        if (!leftHand) return 'Your left hand must have an upgrade material!';

        if (!game.itemHelper.isOwnedBy(player, rightHand)) {
          return 'You do not own that item!';
        }
        if (!game.itemHelper.isOwnedBy(player, leftHand)) {
          return 'You do not own that material!';
        }
        if (!game.itemHelper.canUpgradeItem(rightHand)) {
          return 'I cannot upgrade that item for you!';
        }
        if (!game.itemHelper.canUseItemForUpgrade(leftHand)) {
          return 'That item cannot be used as an upgrade!';
        }

        game.itemHelper.upgradeItem(rightHand, leftHand.name, true);

        const leftRequirements = itemPropertyGet(leftHand, 'requirements');
        const rightRequirements = itemPropertyGet(rightHand, 'requirements');

        if (
          leftRequirements?.baseClass &&
          rightRequirements?.baseClass &&
          leftRequirements.baseClass !== rightRequirements.baseClass
        ) {
          return 'These items are not compatible!';
        }

        game.itemHelper.setItemProperty(
          rightHand,
          'requirements',
          game.itemHelper.mergeItemRequirements(
            leftRequirements,
            rightRequirements,
          ),
        );
        game.itemHelper.setItemProperty(rightHand, 'owner', player.username);

        game.characterHelper.setLeftHand(player, undefined);

        return 'Your item is upgraded!';
      });
  }

  tick() {}
}
