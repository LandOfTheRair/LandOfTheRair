import { GameAction } from '@lotr/interfaces';

// dispatched when the user updates their journal
export class UpdateJournal {
  static type = GameAction.UpdateJournal;
  constructor(public journal: string) {}
}
