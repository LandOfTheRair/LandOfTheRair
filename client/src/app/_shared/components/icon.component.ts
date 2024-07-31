import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { environment } from '../../../environments/environment';

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
      }

      .mac-container.normal .macicons {
        font-size: 300%;
      }

      .mac-container.large {
        min-width: 64px;
        max-width: 64px;
        min-height: 64px;
        max-height: 64px;
      }

      .mac-container.large .macicons {
        font-size: 300%;
      }

      .mac-container.nsmall {
        min-width: 40px;
        max-width: 40px;
        min-height: 40px;
        max-height: 40px;
      }

      .mac-container.nsmall .macicons {
        font-size: 250%;
      }

      .mac-container.small {
        min-width: 32px;
        max-width: 32px;
        min-height: 32px;
        max-height: 32px;
      }

      .mac-container.small .macicons {
        font-size: 200%;
      }

      .mac-container.esmall {
        min-width: 28px;
        max-width: 28px;
        min-height: 28px;
        max-height: 28px;
      }

      .mac-container.esmall .macicons {
        font-size: 175%;
      }

      .mac-container.xsmall {
        min-width: 24px;
        max-width: 24px;
        min-height: 24px;
        max-height: 24px;
      }

      .mac-container.xsmall .macicons {
        font-size: 110%;
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
      <span
        class="macicons"
        [ngClass]="['macicons-' + name()]"
        [style.color]="fgColor()"
      ></span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  public round = input<boolean>(false);
  public name = input<string>('undecided');
  public bgColor = input<string>('white');
  public fgColor = input<string>('#000');
  public size = input<IconSize>('normal');
  public disabled = input<boolean>(false);

  public imgUrl = computed(
    () =>
      `${environment.client.protocol}://${environment.client.domain}:${
        environment.client.port
      }/assets/macicons/${this.name() || 'undecided'}.svg`,
  );
}
