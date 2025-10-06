import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ICharacter } from '@lotr/interfaces';

@Component({
  selector: 'app-life-heart',
  template: `
    <div class="heart">
      <div class="fill" [style.clip-path]="hpPercentGradient()">❤</div>
      <div class="outline">❤</div>
    </div>
  `,
  styles: [
    `
      .heart {
        display: block;
        padding-top: 1px;
        padding-left: 1px;
        width: 18px;
        height: 18px;
        position: relative;
        overflow: hidden;
        user-select: none;
      }

      .fill,
      .outline {
        font-size: 17px;
        line-height: 17px;
        min-height: 14px;
        max-height: 14px;
        position: absolute;
      }

      .fill {
        color: #b72606;
        z-index: 300;
      }

      .outline {
        color: #000;
        z-index: 299;
        text-shadow:
          -1px 0 black,
          0 1px black,
          1px 0 black,
          0 -1px black;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LifeHeartComponent {
  private domSanitizer = inject(DomSanitizer);

  public target = input<ICharacter>();

  public hpPercent = computed(() => 100 - (this.target().hp.current / this.target().hp.maximum) * 100);

  public hpPercentGradient = computed(() => {
    let hpp = this.hpPercent();
    if (hpp >= 5 && hpp < 15) hpp = 15;
    if (hpp >= 15 && hpp < 20) hpp = 20;

    if (hpp >= 80 && hpp < 95) hpp = 80;
    if (hpp >= 95 && hpp <= 100) hpp = 90;
    return this.domSanitizer.bypassSecurityTrustStyle(
      `polygon(0% ${hpp}%, 0% 100%, 100% 100%, 100% ${hpp}%)`,
    );
  });
}
