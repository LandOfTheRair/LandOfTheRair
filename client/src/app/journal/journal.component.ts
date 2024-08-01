import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
} from '@angular/core';
import { select, Store } from '@ngxs/store';
import { JournalState, UpdateJournal } from '../../stores';

@Component({
  selector: 'app-journal',
  templateUrl: './journal.component.html',
  styleUrls: ['./journal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JournalComponent {
  public journalData = select(JournalState.journal);

  public journal: string;

  private store = inject(Store);

  constructor() {
    effect(() => {
      if (this.journal) return;

      this.journal = this.journalData();
    });
  }

  public updateJournal() {
    this.store.dispatch(new UpdateJournal(this.journal));
  }
}
