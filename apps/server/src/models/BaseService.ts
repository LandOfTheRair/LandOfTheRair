// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { Game } from '../helpers';

export abstract class BaseService {
  game: Game;

  abstract init();
}
