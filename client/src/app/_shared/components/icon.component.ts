
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
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
  `],
  template: `
    <div class="mac-container vertical-center" [ngClass]="[size]" [class.round]="round" [class.disabled]="disabled" [style.background-color]="bgColor">
      <span class="macicons" [ngClass]="['macicons-'+name]" [style.color]="fgColor"></span>
    </div>
  `
})
export class IconComponent {

  @Input() public round = false;
  @Input() public name = 'undecided';
  @Input() public bgColor = 'white';
  @Input() public fgColor = '#000';
  @Input() public size = 'normal';
  @Input() public disabled = false;

  get imgUrl() {
    const name = this.name || 'undecided';
    return `${environment.client.protocol}://${environment.client.domain}:${environment.client.port}/assets/macicons/${name}.svg`;
  }

}
