import { Parser } from 'muud';

import { Game } from '../../../../helpers';
import { EquipHash, GameServerResponse, IAIBehavior, IEncrusterBehavior,
  INPC, IPlayer, ItemClass, ItemSlot, ShieldClasses, WeaponClasses } from '../../../../interfaces';

export class EncrusterBehavior implements IAIBehavior {

  init(game: Game, npc: INPC, parser: Parser, behavior: IEncrusterBehavior) {

    let { maxGemLevel } = behavior;
    maxGemLevel ??= 1;

    const gemLevel = maxGemLevel ?? 1;

    parser.addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async ({ env }) => {
        const player = env?.player;
        if (!player) return 'You do not exist.';

        if (game.directionHelper.distFrom(player, npc) > 1) return 'Please come closer.';

        const rightHand = player.items.equipment[ItemSlot.RightHand];
        const leftHand = player.items.equipment[ItemSlot.LeftHand];

        if (!rightHand) {
          return `You do not have anything in your right hand!
                  Either hold a gem and I can tell you more about it, or hold a gem and an item and I can ENCRUST it for you.`;
        }

        const {
          itemClass: rightItemClass,
          encrustGive: rightEncrustGive,
          requirements: rightRequirements
        } = game.itemHelper.getItemProperties(rightHand, ['itemClass', 'encrustGive', 'requirements']);

        if (rightItemClass === ItemClass.Gem) {

          let message = '';

          if (!rightEncrustGive) message = 'This gem has no encrustable qualities. You can encrust it anyway, of course.';

          if (rightEncrustGive?.stats && rightEncrustGive?.strikeEffect) {
            message = 'It looks like this gem gives you an attribute bonus and allows you to impart some effect onto your weapon.';

          } else if (rightEncrustGive?.stats) {
            message = 'It looks like this gem gives you an attribute bonus.';

          } else if (rightEncrustGive?.strikeEffect) {
            message = 'It looks like this gem allows you to impart some effect onto your weapon.';
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
          You can slot this item into the following slots: ${rightEncrustGive?.slots.map(s => s.toUpperCase()).join(', ')}.`;

          env?.callbacks.emit({
            type: GameServerResponse.SendAlert,
            title: 'Gem Appraisal',
            content: message,
            extraData: { npcSprite: npc.sprite },
          });

          return message;
        }

        if (!leftHand) return 'You do not have anything in your left hand!';

        const {
          itemClass: leftItemClass
        } = game.itemHelper.getItemProperties(leftHand, ['itemClass']);

        if (leftItemClass !== ItemClass.Gem) return 'Your left hand must contain a gem!';

        env?.callbacks.emit({
          type: GameServerResponse.SendConfirm,
          title: 'Encrust Gem Into Item?',
          content: 'Would you like to encrust the gem into the item in your right hand?',
          extraData: { npcSprite: npc.sprite, okText: 'Yes, encrust!', cancelText: 'No, not now' },
          okAction: { command: '!privatesay', args: `${npc.uuid}, encrust` }
        });

        return `Hello, ${player.name}! Would you like to ENCRUST the item in your right hand?`;
      });

    parser.addCommand('encrust')
      .setSyntax(['encrust'])
      .setLogic(async ({ env }) => {
        const player: IPlayer = env?.player;
        if (!player) return 'You do not exist.';

        if (game.directionHelper.distFrom(player, npc) > 1) return 'Please come closer.';

        const rightHand = player.items.equipment[ItemSlot.RightHand];
        const leftHand = player.items.equipment[ItemSlot.LeftHand];

        if (!rightHand) return 'You do not have anything in your right hand!';
        if (!leftHand) return 'You do not have anything in your left hand!';
        if (rightHand.mods.owner && rightHand.mods.owner !== player.username) return 'That item belongs to someone else!';
        if (leftHand.mods.owner && leftHand.mods.owner !== player.username) return 'That gem belongs to someone else!';

        const itemClass = game.itemHelper.getItemProperty(rightHand, 'itemClass');

        const {
          itemClass: leftItemClass,
          encrustGive: leftEncrustGive,
          requirements: leftRequirements
        } = game.itemHelper.getItemProperties(leftHand, ['itemClass', 'encrustGive', 'requirements']);
        const rightRequirements = game.itemHelper.getItemProperty(rightHand, 'requirements');

        if (leftItemClass !== ItemClass.Gem) return 'You are not holding a gem in your left hand!';

        if ((leftRequirements?.level ?? 0) > player.level) return 'You aren\'t strong enough to use this gem yet!';

        const slots = leftEncrustGive?.slots ?? [];
        const shouldPass = (slots.includes('weapon') && WeaponClasses.includes(itemClass))
                        || (slots.includes('shield') && ShieldClasses.includes(itemClass))
                        || (slots.includes(EquipHash[itemClass]));

        if (!shouldPass) return 'You cannot encrust that gem into that item.';

        rightHand.mods.encrustItem = leftHand.name;
        
        game.itemHelper.setItemProperty(rightHand, 'requirements', 
          game.itemHelper.mergeItemRequirements(leftRequirements, rightRequirements)
        );

        game.itemHelper.setItemProperty(rightHand, 'owner', player.username);
        game.characterHelper.setLeftHand(player, undefined);

        return 'Enjoy your new encrusted item!';
      });
  }

  tick() {}
}
