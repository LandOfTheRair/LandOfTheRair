import { Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { JournalState, UpdateJournal } from '../../stores';

@AutoUnsubscribe()
@Component({
  selector: 'app-journal',
  templateUrl: './journal.component.html',
  styleUrls: ['./journal.component.scss'],
})
export class JournalComponent implements OnInit {
  @Select(JournalState.journal) private journal$: Observable<string>;

  public journal: string;

  constructor(private store: Store) {}

  ngOnInit() {
    this.journal$.pipe(first()).subscribe((j) => (this.journal = j));
  }

  public updateJournal() {
    this.store.dispatch(new UpdateJournal(this.journal));
  }
}
