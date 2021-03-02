import { Stat } from './building-blocks';

export interface IDynamicEvent {
  name: string;
  description: string;
  endsAt: number;
  statBoost?: Partial<Record<Stat, number>>;
  extraData?: any;
}
