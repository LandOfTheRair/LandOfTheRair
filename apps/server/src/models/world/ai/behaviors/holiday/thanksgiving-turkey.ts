import { random } from 'lodash';
import type { Parser } from 'muud';

import type { IAIBehavior, INPC } from '@lotr/interfaces';
import { Currency, ItemSlot } from '@lotr/interfaces';
import { distanceFrom } from '@lotr/shared';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { gainCurrency } from '@lotr/currency';
import { rollInOneHundred } from '@lotr/rng';
import type { Game } from '../../../../../helpers';

const tokenTable = [
  { result: 2, chance: 15 },
  { result: 10, chance: 500 },
  { result: 15, chance: 500 },
  { result: 25, chance: 500 },
  { result: 50, chance: 200 },
  { result: 100, chance: 5 },
  { result: 1000, chance: 3 },
  { result: 5000, chance: 1 },
];

const itemTable = [
  { chance: 5500, result: 'Thanksgiving Corn' },
  { chance: 5500, result: 'Thanksgiving Cornbread' },
  { chance: 4000, result: 'Thanksgiving Heal Bottle (XS)' },
  { chance: 3600, result: 'Rune Scroll - Slow Digestion I' },
  { chance: 2400, result: 'Thanksgiving Arrows' },
  { chance: 1800, result: 'Thanksgiving Heal Bottle (SM)' },
  { chance: 1300, result: 'Gold Coin' },
  { chance: 800, result: 'Thanksgiving Gem' },
  { chance: 600, result: 'Rune Scroll - Slow Digestion II' },
  { chance: 400, result: 'Thanksgiving Bead Amulet' },
  { chance: 200, result: 'Rune Scroll - Slow Digestion III' },
  { chance: 150, result: 'Thanksgiving Heal Bottle (MD)' },
  { chance: 65, result: 'Antanian Charisma Potion' },
  { chance: 35, result: 'Rune Scroll - Slow Digestion IV' },
  { chance: 15, result: 'Thanksgiving Heal Bottle' },
  { chance: 1, result: 'Thanksgiving Pilgrim Hat' },
  { chance: 1, result: 'Thanksgiving Pilgrim Boots' },
  { chance: 1, result: 'Thanksgiving Pilgrim Cloak' },
  { chance: 1, result: 'Thanksgiving Gobbler Staff' },
  { chance: 1, result: 'Rune Scroll - Slow Digestion V' },
];

export class ThanksgivingTurkeyBehavior implements IAIBehavior {
  usesRemaining = 1;

  init(game: Game, npc: INPC, parser: Parser) {
    parser

      .addCommand('hello')

      .setSyntax(['hello'])
      .setLogic(async ({ env }) => {
        const player = env?.player;
        if (!player) return 'You do not exist.';

        if (distanceFrom(player, npc) > 0) return 'Gobble? Gobble gobble?';

        if (player.items.equipment[ItemSlot.RightHand]) {
          if (
            player.items.equipment[ItemSlot.RightHand].name ===
            'Thanksgiving Turkey Feather'
          ) {
            game.characterHelper.setRightHand(player, undefined);

            if (rollInOneHundred(90)) {
              const results =
                game.lootHelper.chooseWithoutReplacement(tokenTable);
              const tokens = results[0] as unknown as number;

              game.messageHelper.sendLogMessageToPlayer(player, {
                message: `Koda hands you ${tokens} turkey coins!`,
              });
              gainCurrency(player, tokens, Currency.Thanksgiving);
            } else {
              const results =
                game.lootHelper.chooseWithoutReplacement(itemTable);
              const item = results[0];

              const rawItem = game.itemCreator.getSimpleItem(item);
              if (rawItem.name === 'Gold Coin') {
                rawItem.mods.value = random(10000, 500000) as number;
              }

              game.characterHelper.setRightHand(player, rawItem);
            }

            this.usesRemaining--;
            if (this.usesRemaining <= 0) {
              this.move(game, npc);
              this.usesRemaining = random(1, 5);
            }

            return 'Gobble!';
          }

          return 'Gobble?';
        }

        return 'Gobble! Gobble gobble! Gobble? Gobble!';
      });
  }

  tick() {}

  private move(game: Game, npc: INPC) {
    const state = game.worldManager.getMap(npc.map)?.state;

    let x;
    let y;

    do {
      const mapRef = game.worldManager.getMap('TurkeyForest');
      if (mapRef) {
        const { map: checkMap } = mapRef;

        x = random(4, checkMap.width - 4);
        y = random(4, checkMap.height - 4);

        if (!checkMap.getWallAt(x, y) || checkMap.getDenseDecorAt(x, y)) {
          let isValidSpawn = true;
          for (let xx = x - 2; xx <= x + 2; xx++) {
            for (let yy = y - 2; yy <= y + 2; yy++) {
              if (
                checkMap.getWallAt(xx, yy) ||
                checkMap.getDenseDecorAt(x, y) ||
                checkMap.getFluidAt(x, y)
              ) {
                isValidSpawn = false;
              }
            }
          }

          if (!isValidSpawn) {
            x = null;
            y = null;
          }
        } else {
          x = null;
          y = null;
        }
      }
    } while (!x || !y);

    const oldX = npc.x;
    const oldY = npc.y;

    npc.x = x;
    npc.y = y;

    state?.moveNPCOrPlayer(npc, { oldX, oldY });
  }
}
