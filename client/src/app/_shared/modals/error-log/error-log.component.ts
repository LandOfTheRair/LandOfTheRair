import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { LoggerService } from '../../../services/logger.service';

@Component({
  selector: 'app-error-log',
  templateUrl: './error-log.component.html',
  styleUrls: ['./error-log.component.scss']
})
export class ErrorLogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ErrorLogComponent>,
    public logger: LoggerService
  ) {}

  ngOnInit() {
  }

  errorIndex(index, item) {
    return item.message;
  }

}
