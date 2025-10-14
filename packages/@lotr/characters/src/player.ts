import type { ICharacter, IPlayer } from '@lotr/interfaces';
import { DateTime } from 'luxon';

// get the offset for players daily quests
function playerDailyOffsetGet(player: IPlayer): number {
  return player.name.charCodeAt(0);
}

// check if a character is a player
export function isPlayer(character: ICharacter): boolean {
  return !!(character as IPlayer).username;
}

export function playerGetCurrentDaily(player: IPlayer): number {
  const now = DateTime.fromObject({ zone: 'utc' });
  const start = DateTime.fromObject({
    zone: 'utc',
    year: now.year,
    month: 1,
    day: 1,
  });
  const diff = +now - +start;
  const oneDay = 1000 * 60 * 60 * 24;
  const day = Math.floor(diff / oneDay);

  return day + playerDailyOffsetGet(player);
}
