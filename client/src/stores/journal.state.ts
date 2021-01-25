
import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { IJournal } from '../interfaces';
import { UpdateJournal } from './actions';


@State<IJournal>({
  name: 'journal',
  defaults: { journalData: '' }
})
@Injectable()
export class JournalState {

  @Selector()
  static journal(state: IJournal) {
    return state.journalData;
  }

  @Action(UpdateJournal)
  login(ctx: StateContext<IJournal>, { journal }: UpdateJournal) {
    ctx.patchState({ journalData: journal });
  }

}
