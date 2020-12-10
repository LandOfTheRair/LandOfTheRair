import { Currency } from './building-blocks';

export interface IAccountBank {
  deposits: Partial<Record<Currency, number>>;
}
