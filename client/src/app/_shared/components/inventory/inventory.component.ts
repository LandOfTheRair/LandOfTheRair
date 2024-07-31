import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { select } from '@ngxs/store';
import { IItemContainer } from '../../../../interfaces';
import { GameState } from '../../../../stores';
import {
  ItemSize,
  MenuContext,
} from '../../../_shared/components/item/item.component';
import { UIService } from '../../../services/ui.service';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryComponent {
  public player = select(GameState.player);

  public size = input<number>();
  public displaySize = input<ItemSize>('normal');
  public dropContext? = input<string>();
  public context = input<MenuContext>();
  public container = input<IItemContainer>();

  public realDropContext = computed(() => this.dropContext() || this.context());

  public slots = computed(() =>
    Array(this.size())
      .fill(null)
      .map((v, i) => i),
  );

  constructor(public uiService: UIService) {}
}
