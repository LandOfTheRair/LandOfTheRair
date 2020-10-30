
import { IAccount } from '../interfaces';

export function isSubscribed(account: IAccount): boolean {
  return account.isGameMaster || account.isTester || account.isSubscribed;
}
