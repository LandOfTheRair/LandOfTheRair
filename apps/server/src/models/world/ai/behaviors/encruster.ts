import type { Parser } from 'muud';

import type {
  IAIBehavior,
  IDialogChatAction,
  IEncrusterBehavior,
  INPC,
  IPlayer,
  WeaponClass,
} from '@lotr/interfaces';
import {
  EquipHash,
  GameServerResponse,
  ItemClass,
  ItemSlot,
  LearnedSpell,
  ShieldClasses,
  WeaponClasses,
} from '@lotr/interfaces';
import { distanceFrom } from '@lotr/shared';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { forceSpellLearnStatus, hasLearned } from '@lotr/characters';
import {
  itemPropertiesGet,
  itemPropertyGet,
  itemPropertySet,
  itemSetEncrust,
  settingGameGet,
} from '@lotr/content';
import { hasCurrency, loseCurrency } from '@lotr/currency';
import type { Game } from '../../../../helpers';

export class EncrusterBehavior implements IAIBehavior {
  init(game: Game, npc: INPC, parser: Parser, behavior: IEncrusterBehavior) {
    let { maxGemLevel } = behavior;
    maxGemLevel ??= 1;

    const gemLevel = maxGemLevel ?? 1;

    parser
      .addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async ({ env }) => {
        const player = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 1) return 'Please come closer.';

        const message = `Hello, ${player.name}!
        You can tell me you want to do ENCRUSTING, or I can TEACH you about Gemcrafting!`;

        const options = [
          { text: 'Encrusting', action: 'encrusting' },
          { text: 'Leave', action: 'noop' },
        ];

        if (!hasLearned(player, 'Gemcrafting')) {
          options.unshift({
            text: 'Teach me about Gemcrafting',
            action: 'teach',
          });
        }

        const formattedChat: IDialogChatAction = {
          message,
          displayTitle: npc.name,
          displayNPCName: npc.name,
          displayNPCSprite: npc.sprite,
          displayNPCUUID: npc.uuid,
          options,
        };

        game.transmissionHelper.sendResponseToAccount(
          player.username,
          GameServerResponse.DialogChat,
          formattedChat,
        );

        return message;
      });

    parser
      .addCommand('encrusting')
      .setSyntax(['encrusting'])
      .setLogic(async ({ env }) => {
        const player = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 1) return 'Please come closer.';

        const rightHand = player.items.equipment[ItemSlot.RightHand];
        const leftHand = player.items.equipment[ItemSlot.LeftHand];

        if (!rightHand) {
          return `You do not have anything in your right hand!
                  Either hold a gem and I can tell you more about it, or hold a gem and an item and I can ENCRUST it for you.`;
        }

        const {
          itemClass: rightItemClass,
          encrustGive: rightEncrustGive,
          requirements: rightRequirements,
          encrustItem: rightEncrustItem,
        } = itemPropertiesGet(rightHand, [
          'itemClass',
          'encrustGive',
          'requirements',
          'encrustItem',
        ]);

        if (rightItemClass === ItemClass.Gem) {
          let message = '';

          if (!rightEncrustGive) {
            message =
              'This gem has no encrustable qualities. You can encrust it anyway, of course.';
          }

          if (rightEncrustGive?.stats && rightEncrustGive?.strikeEffect) {
            message =
              'It looks like this gem gives you an attribute bonus and allows you to impart some effect onto your weapon strikes.';
          } else if (rightEncrustGive?.stats) {
            message = 'It looks like this gem gives you an attribute bonus.';
          } else if (rightEncrustGive?.strikeEffect) {
            message =
              'It looks like this gem allows you to impart some effect onto your weapon strikes.';
          }

          if (rightRequirements?.level) {
            message = `${message} You'll need to be level ${rightRequirements.level} to encrust this gem.`;

            if (rightRequirements.level > player.level) {
              message = `${message} You aren't strong enough to use this gem yet!`;
            }

            if (rightRequirements.level > gemLevel) {
              message = `${message} I CANNOT help you with this gem - it's too complicated for me!`;
            }
          }

          message = `${message}
          You can slot this item into the following slots: ${rightEncrustGive?.slots.map((s) => s.toUpperCase()).join(', ')}.`;

          env?.callbacks.emit({
            type: GameServerResponse.SendAlert,
            title: 'Gem Appraisal',
            content: message,
            extraData: { npcSprite: npc.sprite },
          });

          return message;
        }

        if (!leftHand && rightEncrustItem) {
          const gemItem = game.itemCreator.getSimpleItem(rightEncrustItem);

          const { encrustGive: encrustEncrustGive, desc: encrustEncrustDesc } =
            itemPropertiesGet(gemItem, ['encrustGive', 'desc']);

          let message = '';

          if (!encrustEncrustGive) {
            message = `This encrusted gem is ${encrustEncrustDesc}, and it has no encrustable qualities.`;
          }

          if (encrustEncrustGive?.stats && encrustEncrustGive?.strikeEffect) {
            message = `This encrusted gem is ${encrustEncrustDesc}, and it gives you an attribute bonus
              as well as imparting some effect onto your weapon strikes.`;
          } else if (encrustEncrustGive?.stats) {
            message = `This encrusted gem is ${encrustEncrustDesc}, and it gives you an attribute bonus.`;
          } else if (encrustEncrustGive?.strikeEffect) {
            message = `This encrusted gem is ${encrustEncrustDesc}, and it imparts some effect onto your weapon strikes.`;
          }

          env?.callbacks.emit({
            type: GameServerResponse.SendAlert,
            title: 'Gem Appraisal',
            content: message,
            extraData: { npcSprite: npc.sprite },
          });

          return message;
        }

        if (!leftHand && !rightEncrustItem) {
          return 'You do not have anything in your left hand!';
        }

        const { itemClass: leftItemClass } = itemPropertiesGet(leftHand, [
          'itemClass',
        ]);

        if (leftItemClass !== ItemClass.Gem) {
          return 'Your left hand must contain a gem!';
        }

        env?.callbacks.emit({
          type: GameServerResponse.SendConfirm,
          title: 'Encrust Gem Into Item?',
          content:
            'Would you like to encrust the gem into the item in your right hand?',
          extraData: {
            npcSprite: npc.sprite,
            okText: 'Yes, encrust!',
            cancelText: 'No, not now',
          },
          okAction: { command: '!privatesay', args: `${npc.uuid}, encrust` },
        });

        return `Hello, ${player.name}! Would you like to ENCRUST the item in your right hand?`;
      });

    parser
      .addCommand('encrust')
      .setSyntax(['encrust'])
      .setLogic(async ({ env }) => {
        const player: IPlayer = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 1) return 'Please come closer.';

        const rightHand = player.items.equipment[ItemSlot.RightHand];
        const leftHand = player.items.equipment[ItemSlot.LeftHand];

        if (!rightHand) return 'You do not have anything in your right hand!';
        if (!leftHand) return 'You do not have anything in your left hand!';
        if (rightHand.mods.owner && rightHand.mods.owner !== player.username) {
          return 'That item belongs to someone else!';
        }
        if (leftHand.mods.owner && leftHand.mods.owner !== player.username) {
          return 'That gem belongs to someone else!';
        }

        const { itemClass, destroyOnDrop, shots } = itemPropertiesGet(
          rightHand,
          ['itemClass', 'destroyOnDrop', 'shots'],
        );
        const weaponItemClass = itemClass ?? ItemClass.Rock;

        if (destroyOnDrop) {
          return 'That item is too transient for me to encrust it!';
        }
        if ((shots ?? 0) > 0) {
          return 'There is too much of that item for me to encrust it!';
        }

        const {
          itemClass: leftItemClass,
          encrustGive: leftEncrustGive,
          requirements: leftRequirements,
        } = itemPropertiesGet(leftHand, [
          'itemClass',
          'encrustGive',
          'requirements',
        ]);
        const rightRequirements = itemPropertyGet(rightHand, 'requirements');

        const encrustGemLevel = leftRequirements?.level ?? 0;
        const encrustCostPerlevel =
          settingGameGet('npcscript', 'encruster.encrustCostPerLevel') ?? 1000;

        const encrustCost = Math.max(
          1000,
          encrustGemLevel * encrustCostPerlevel,
        );
        if (!hasCurrency(player, encrustCost)) {
          return `You do need to pay for this, you know. ${encrustCost.toLocaleString()} gold is not a lot!`;
        }

        if (leftItemClass !== ItemClass.Gem) {
          return 'You are not holding a gem in your left hand!';
        }

        if (encrustGemLevel > player.level) {
          return "You aren't strong enough to use this gem yet!";
        }

        if (encrustGemLevel > gemLevel) {
          return "I cannot help you with this gem - it's too complicated for me!";
        }

        if (
          leftRequirements?.baseClass &&
          rightRequirements?.baseClass &&
          leftRequirements.baseClass !== rightRequirements.baseClass
        ) {
          return 'These items are not compatible!';
        }

        const slots = leftEncrustGive?.slots ?? [];
        const shouldPass =
          (slots.includes('weapon') &&
            WeaponClasses.includes(weaponItemClass as WeaponClass)) ||
          (slots.includes('shield') &&
            ShieldClasses.includes(weaponItemClass as WeaponClass)) ||
          slots.includes(EquipHash[weaponItemClass]);

        if (!shouldPass) return 'You cannot encrust that gem into that item.';

        itemSetEncrust(rightHand, leftHand);

        itemPropertySet(
          rightHand,
          'requirements',
          game.itemHelper.mergeItemRequirements(
            leftRequirements,
            rightRequirements,
          ),
        );

        loseCurrency(player, encrustCost);
        itemPropertySet(rightHand, 'owner', player.username);
        game.characterHelper.setLeftHand(player, undefined);

        return 'Enjoy your new encrusted item!';
      });

    parser
      .addCommand('teach')
      .setSyntax(['teach'])
      .setLogic(async ({ env }) => {
        const player: IPlayer = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 2) return 'Please come closer.';

        if (hasLearned(player, 'Gemcrafting')) {
          return 'You already know Gemcrafting!';
        }

        forceSpellLearnStatus(player, 'Gemcrafting', LearnedSpell.FromFate);
        forceSpellLearnStatus(player, 'Shatter', LearnedSpell.FromFate);

        return 'Go forth and make great jewelry!';
      });
  }

  tick() {}
}
