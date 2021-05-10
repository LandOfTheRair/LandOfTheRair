import { Parser } from 'muud';
import { random, sample } from 'lodash';

import { Game } from '../../../../helpers';
import { DamageClass, distanceFrom, Holiday, Hostility, INPC, IPlayer, ItemSlot, SoundEffect } from '../../../../interfaces';

export const trickOrTreat = (game: Game, npc: INPC, parser: Parser): void => {
  const talkedTo = {};

  parser.addCommand('trick or treat')
    .setSyntax(['trick or treat'])
    .setLogic(async ({ env }) => {

      const player: IPlayer = env?.player;
      if (!player) return 'You do not exist.';

      if (npc.hostility !== Hostility.Never) return '';
      if (!game.holidayHelper.isHoliday(Holiday.Halloween)) return 'I think you might be mistaken.';

      if (distanceFrom(player, npc) > 2) return 'Please come closer.';

      if (talkedTo[player.uuid]) return 'Hey, one per person! Come back later and I might have extra.';

      if (player.items.equipment[ItemSlot.RightHand]?.name !== 'Halloween Basket') return 'What, where is your basket? Come back with one!';
      if (player.items.equipment[ItemSlot.LeftHand]) return 'You need an empty left hand for the candy!';

      talkedTo[player.uuid] = true;

      if (game.diceRollerHelper.XInOneHundred(20)) {

        if (game.diceRollerHelper.XInOneHundred(30) && player.exp > 5000) {
          game.playerHelper.loseExp(player, random(100, 1000));

        } else {
          game.combatHelper.dealOnesidedDamage(player, {
            damage: 10,
            damageClass: DamageClass.Physical,
            damageMessage: 'You were hit by surprise!',
            overrideSfx: SoundEffect.CombatHitMelee
          });
        }

        return 'Ha ha, tricked ya!';
      }

      let item = sample([
        'Halloween Candy - Lollipops',
        'Halloween Candy - Gummies',
        'Halloween Candy - Wrapped',
        'Halloween Candy - Jellies',
        'Halloween Candy - Mints'
      ]);

      if (game.diceRollerHelper.XInOneHundred(10)) item = 'Halloween Candy Pile';

      game.characterHelper.setLeftHand(player, game.itemCreator.getSimpleItem(item as string));

      return 'Here you go! Happy holidays!';
    });
};
