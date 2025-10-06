import type { Parser } from 'muud';

import type {
  IAIBehavior,
  INPC,
  IPlayer,
  ISpoilerLogger,
  WeaponClass,
} from '@lotr/interfaces';
import { ItemClass, ItemSlot, WeaponClasses } from '@lotr/interfaces';
import { distanceFrom } from '@lotr/shared';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { Game } from '../../../../helpers';

export class RNGArtificerBehavior implements IAIBehavior {
  init(game: Game, npc: INPC, parser: Parser, behavior: ISpoilerLogger) {
    parser
      .addCommand('hello')
      .setSyntax(['hello'])
      .setLogic(async ({ env }) => {
        const player: IPlayer = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 2) return 'Please come closer.';

        const rightHand = player.items.equipment[ItemSlot.RightHand];
        if (!rightHand) {
          return `Greetings, ${player.name}!
                  I can upgrade your weapons found in the twisting ether, as long as you have the requisite materials.
                  I find that this process lets the weapon itself last much longer!`;
        }

        const { name, itemClass, tier, requirements } =
          game.itemHelper.getItemProperties(rightHand, [
            'name',
            'itemClass',
            'tier',
            'requirements',
          ]);

        const requirementsLevel = requirements?.level ?? 0;
        const isWeapon =
          WeaponClasses.includes(itemClass as WeaponClass) ||
          itemClass === ItemClass.Claws ||
          itemClass === ItemClass.Gloves;

        if (itemClass === ItemClass.Arrow) {
          return 'Unfortunately, the quantity of item here is too much to upgrade!';
        }

        if (!isWeapon) {
          return 'That item is not a weapon! I thought I was very clear!';
        }

        if ((tier ?? 0) < 4) return 'That item is too weak for me to upgrade!';

        if (requirementsLevel < 20) {
          return 'That item is too weak for me to upgrade!';
        }

        if (requirementsLevel >= 45) {
          return 'That item is too powerful for me to upgrade!';
        }

        if (!game.itemHelper.isEtherForceItem(name ?? '')) {
          return 'That item does not originate from the twisted ether!';
        }

        let neededItem = '';
        let neededQty = 0;
        let requiredLevel = 0;

        if (requirementsLevel === 20) {
          neededItem = 'Orikalcum Ingot';
          neededQty = 1;
          requiredLevel = 25;
        }

        if (requirementsLevel === 25) {
          neededItem = 'Orikalcum Ingot';
          neededQty = 2;
          requiredLevel = 30;
        }

        if (requirementsLevel === 30) {
          neededItem = 'Orikalcum Ingot';
          neededQty = 3;
          requiredLevel = 35;
        }

        if (requirementsLevel === 35) {
          neededItem = 'Soronite Ingot';
          neededQty = 2;
          requiredLevel = 40;
        }

        if (requirementsLevel === 40) {
          neededItem = 'Soronite Ingot';
          neededQty = 3;
          requiredLevel = 45;
        }

        if (player.level < requiredLevel) {
          return `You need to be level ${requiredLevel} to upgrade this ${itemClass?.toLowerCase()}!`;
        }

        const matchingItems = player.items.sack.items
          .filter(
            (x) =>
              x.name === neededItem && game.itemHelper.isOwnedBy(player, x),
          )
          .slice(0, neededQty);

        if (matchingItems.length < neededQty) {
          return `To upgrade this item to the next stage, you need ${neededQty} ${neededItem.toLowerCase()}(s) in your sack!`;
        }

        if (requirementsLevel === 20) {
          rightHand.mods.tier = 5;
          rightHand.mods.requirements = { level: 25 };
        }

        if (requirementsLevel === 25) {
          rightHand.mods.tier = 6;
          rightHand.mods.requirements = { level: 30 };
        }

        if (requirementsLevel === 30) {
          rightHand.mods.tier = 7;
          rightHand.mods.requirements = { level: 35 };
        }

        if (requirementsLevel === 35) {
          rightHand.mods.requirements = { level: 40 };

          Object.keys(rightHand.mods.stats ?? {}).forEach((stat) => {
            rightHand.mods.stats![stat] = rightHand.mods.stats![stat]! * 2;
          });
        }

        if (requirementsLevel === 40) {
          rightHand.mods.tier = 8;
          rightHand.mods.requirements = { level: 45 };
        }

        game.inventoryHelper.removeItemsFromSackByUUID(
          player,
          matchingItems.map((x) => x.uuid),
        );

        return `Your ${itemClass?.toLowerCase()} has been upgraded to the next stage!`;
      });
  }

  tick() {}
}
