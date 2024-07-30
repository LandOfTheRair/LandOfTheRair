import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { LoggerService } from '../../../services/logger.service';

@Component({
  selector: 'app-error-log',
  templateUrl: './error-log.component.html',
  styleUrls: ['./error-log.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorLogComponent {
  public dialogRef = inject(MatDialogRef<ErrorLogComponent>);
  public logger = inject(LoggerService);
}
