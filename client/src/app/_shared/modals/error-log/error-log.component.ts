import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { LoggerService } from '../../../services/logger.service';

@Component({
  selector: 'app-error-log',
  templateUrl: './error-log.component.html',
  styleUrls: ['./error-log.component.scss'],
})
export class ErrorLogComponent {
  constructor(
    public dialogRef: MatDialogRef<ErrorLogComponent>,
    public logger: LoggerService,
  ) {}
}
