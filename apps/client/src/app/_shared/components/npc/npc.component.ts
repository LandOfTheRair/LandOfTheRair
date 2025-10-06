import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { AssetService } from '../../../services/asset.service';

@Component({
  selector: 'app-npc',
  templateUrl: './npc.component.html',
  styleUrls: ['./npc.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NPCComponent {
  private assetService = inject(AssetService);
  public sprite = input.required<number>();

  get imgUrl() {
    return this.assetService.creaturesUrl;
  }

  public spriteLocation = computed(() => {
    const sprite = this.sprite();

    if (!sprite) return '0px 0px';
    const y = Math.floor(sprite / 40);
    const x = sprite % 40;
    return `-${x * 64}px -${y * 64}px`;
  });
}
