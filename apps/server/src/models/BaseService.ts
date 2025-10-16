import type { IServerGame } from '@lotr/interfaces';

export abstract class BaseService {
  game: IServerGame;

  abstract init();
}
