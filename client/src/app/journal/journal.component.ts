import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { JournalState, UpdateJournal } from '../../stores';

@Component({
  selector: 'app-journal',
  templateUrl: './journal.component.html',
  styleUrls: ['./journal.component.scss'],
})
export class JournalComponent {
  @Select(JournalState.journal) private journal$: Observable<string>;

  public journal: string;

  private store = inject(Store);
  
  constructor() {
    this.journal$
      .pipe(takeUntilDestroyed())
      .pipe(first())
      .subscribe((j) => (this.journal = j));
  }

  public updateJournal() {
    this.store.dispatch(new UpdateJournal(this.journal));
  }
}
