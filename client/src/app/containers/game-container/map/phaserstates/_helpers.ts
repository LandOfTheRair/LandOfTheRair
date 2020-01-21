import { Allegiance, Direction, IPlayer } from '../../../../../models';

export const basePlayerSprite = (player: IPlayer) => {
  let choices = { male: 725, female: 675 };

  switch (player.allegiance) {
    case Allegiance.Townsfolk:   { choices = { male: 725, female: 675 }; break; }
    case Allegiance.Wilderness:  { choices = { male: 730, female: 680 }; break; }
    case Allegiance.Royalty:     { choices = { male: 735, female: 685 }; break; }
    case Allegiance.Adventurers: { choices = { male: 740, female: 690 }; break; }
    case Allegiance.Underground: { choices = { male: 745, female: 695 }; break; }
    case Allegiance.Pirates:     { choices = { male: 750, female: 700 }; break; }
  }

  return choices[player.gender];
};

export const basePlayerSwimmingSprite = (player: IPlayer) => {
  let choices = { male: 6, female: 0 };

  switch (player.allegiance) {
    case Allegiance.Townsfolk:   { choices = { male: 6,  female: 0 }; break; }
    case Allegiance.Wilderness:  { choices = { male: 7,  female: 1 }; break; }
    case Allegiance.Royalty:     { choices = { male: 8,  female: 2 }; break; }
    case Allegiance.Adventurers: { choices = { male: 9,  female: 3 }; break; }
    case Allegiance.Underground: { choices = { male: 10, female: 4 }; break; }
    case Allegiance.Pirates:     { choices = { male: 11, female: 5 }; break; }
  }

  return choices[player.gender];
};

export const spriteOffsetForDirection = (dir: Direction): number => {
  switch (dir) {
    case Direction.South:  return 0;
    case Direction.West:   return 1;
    case Direction.East:   return 2;
    case Direction.North:  return 3;
    case Direction.Corpse: return 4;
    default:               return 0;
  }
};

export const swimmingSpriteOffsetForDirection = (dir: Direction): number => {
  switch (dir) {
    case Direction.South:  return 60;
    case Direction.West:   return 84;
    case Direction.East:   return 36;
    case Direction.North:  return 12;
    case Direction.Corpse: return 60;
    default:               return 60;
  }
};
