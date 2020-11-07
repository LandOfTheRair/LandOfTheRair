import { Component, Input } from '@angular/core';
import { AssetService } from '../../../services/asset.service';

@Component({
  selector: 'app-npc',
  templateUrl: './npc.component.html',
  styleUrls: ['./npc.component.scss']
})
export class NPCComponent {

  @Input() public sprite: number;

  get imgUrl() {
    return this.assetService.creaturesUrl;
  }

  get spriteLocation() {
    if (!this.sprite) return '0px 0px';
    const y = Math.floor(this.sprite / 40);
    const x = this.sprite % 40;
    return `-${x * 64}px -${y * 64}px`;
  }

  constructor(private assetService: AssetService) {}

}
