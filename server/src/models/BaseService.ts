import { Game } from '../helpers';

export abstract class BaseService {
  game: Game;

  abstract init();
}
