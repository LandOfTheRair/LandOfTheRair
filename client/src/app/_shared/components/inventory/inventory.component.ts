import { Component, Input, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { IItemContainer, IPlayer } from '../../../../interfaces';
import { GameState } from '../../../../stores';
import { UIService } from '../../../services/ui.service';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent implements OnInit {

  @Select(GameState.player) player$: Observable<IPlayer>;

  @Input() public size: number;
  @Input() public displaySize = 'lg';
  @Input() public dropContext?: string;
  @Input() public context: 'Sack' | 'Belt' | 'DemiMagicPouch' | string;
  @Input() public container: IItemContainer;

  public get realDropContext(): string {
    return this.dropContext || this.context;
  }

  public get slots() {
    return Array(this.size).fill(null).map((v, i) => i);
  }

  constructor(public uiService: UIService) { }

  ngOnInit() {
  }

}
