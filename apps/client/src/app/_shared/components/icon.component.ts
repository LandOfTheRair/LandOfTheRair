import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { AssetService } from '../../services/asset.service';

export type IconSize =
  | 'xsmall'
  | 'esmall'
  | 'nsmall'
  | 'small'
  | 'normal'
  | 'large';

@Component({
  selector: 'app-icon',
  styles: [
    `
      .mac-container {
        min-width: 48px;
        max-width: 48px;
        min-height: 48px;
        max-height: 48px;
        overflow: hidden;

        .macicon {
          max-height: 48px;
          max-width: 48px;
        }
      }

      .mac-container.large {
        min-width: 64px;
        max-width: 64px;
        min-height: 64px;
        max-height: 64px;

        .macicon {
          max-height: 64px;
          max-width: 64px;
        }
      }

      .mac-container.nsmall {
        min-width: 40px;
        max-width: 40px;
        min-height: 40px;
        max-height: 40px;

        .macicon {
          max-height: 40px;
          max-width: 40px;
        }
      }

      .mac-container.small {
        min-width: 32px;
        max-width: 32px;
        min-height: 32px;
        max-height: 32px;

        .macicon {
          max-height: 32px;
          max-width: 32px;
        }
      }

      .mac-container.esmall {
        min-width: 28px;
        max-width: 28px;
        min-height: 28px;
        max-height: 28px;

        .macicon {
          max-height: 28px;
          max-width: 28px;
        }
      }

      .mac-container.xsmall {
        min-width: 24px;
        max-width: 24px;
        min-height: 24px;
        max-height: 24px;

        .macicon {
          max-height: 24px;
          max-width: 24px;
        }
      }

      .mac-container.round {
        border-radius: 50%;
      }

      .mac-container.disabled {
        filter: grayscale(1) opacity(0.5) blur(2px);
      }
    `,
  ],
  template: `
    <div
      class="mac-container vertical-center"
      [ngClass]="[size()]"
      [class.round]="round()"
      [class.disabled]="disabled()"
      [style.background-color]="bgColor()"
    >
      @if (name()) {
        <svg-icon
          class="macicon"
          [name]="name()"
          [svgStyle]="{
            'width.px': dimensions(),
            'height.px': dimensions(),
            fill: fgColor(),
          }"
        ></svg-icon>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  private assetService = inject(AssetService);

  public round = input<boolean>(false);
  public name = input<string>();
  public bgColor = input<string>('white');
  public fgColor = input<string>('#000');
  public size = input<IconSize>('normal');
  public disabled = input<boolean>(false);

  public dimensions = computed(() => {
    switch (this.size()) {
      case 'xsmall':
        return 24;
      case 'esmall':
        return 28;
      case 'nsmall':
        return 40;
      case 'small':
        return 32;
      case 'normal':
        return 48;
      case 'large':
        return 64;
    }
  });

  public imgUrl = computed(
    () =>
      `${this.assetService.assetBaseUrl}/assets/macicons/${this.name()}.svg`,
  );
}
