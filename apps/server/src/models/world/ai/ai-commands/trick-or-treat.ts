import { random, sample } from 'lodash';
import type { Parser } from 'muud';

import type { INPC, IPlayer, IServerGame } from '@lotr/interfaces';
import {
  DamageClass,
  Holiday,
  Hostility,
  ItemSlot,
  SoundEffect,
} from '@lotr/interfaces';
import { distanceFrom } from '@lotr/shared';

import { isHoliday } from '@lotr/content';
import { rollInOneHundred } from '@lotr/rng';

export const trickOrTreat = (
  game: IServerGame,
  npc: INPC,
  parser: Parser,
): void => {
  const talkedTo = {};

  parser
    .addCommand('trick or treat')
    .setSyntax(['trick or treat'])
    .setLogic(async ({ env }) => {
      const player: IPlayer = env?.player;
      if (!player) return 'You do not exist.';

      if (npc.hostility !== Hostility.Never) return '';
      if (!isHoliday(Holiday.Halloween)) {
        return 'I think you might be mistaken.';
      }

      if (distanceFrom(player, npc) > 2) return 'Please come closer.';

      if (talkedTo[player.uuid]) {
        return 'Hey, one per person! Come back later and I might have extra.';
      }

      if (
        player.items.equipment[ItemSlot.RightHand]?.name !== 'Halloween Basket'
      ) {
        return 'What, where is your basket? Come back with one!';
      }
      if (player.items.equipment[ItemSlot.LeftHand]) {
        return 'You need an empty left hand for the candy!';
      }

      talkedTo[player.uuid] = true;

      if (rollInOneHundred(20)) {
        if (rollInOneHundred(30) && player.exp > 5000) {
          game.playerHelper.loseExp(player, random(100, 1000));
        } else {
          game.combatHelper.dealOnesidedDamage(player, {
            damage: 10,
            damageClass: DamageClass.Physical,
            damageMessage: 'You were hit by surprise!',
            overrideSfx: SoundEffect.CombatHitMelee,
          });
        }

        return 'Ha ha, tricked ya!';
      }

      let item = sample([
        'Halloween Candy - Lollipops',
        'Halloween Candy - Gummies',
        'Halloween Candy - Wrapped',
        'Halloween Candy - Jellies',
        'Halloween Candy - Mints',
      ]);

      if (rollInOneHundred(10)) {
        item = 'Halloween Candy Pile';
      }

      game.characterHelper.setLeftHand(
        player,
        game.itemCreator.getSimpleItem(item as string),
      );

      return 'Here you go! Happy holidays!';
    });
};
