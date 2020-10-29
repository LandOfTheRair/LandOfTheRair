import { ErrorHandler, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AlertComponent } from './_shared/components/alert/alert.component';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  private ignoredErrorMessages = {};
  private canShowErrors = true;

  constructor(private dialog: MatDialog) {}

  public showErrorWindow(title: string, content: string) {
    if (this.ignoredErrorMessages[title] || !this.canShowErrors || !title || !content) return;

    this.dialog.afterAllClosed.subscribe(() => {
      this.canShowErrors = true;
    });

    this.canShowErrors = false;
    console.log(title, content);
    this.dialog.open(AlertComponent, {
      width: '250px',
      data: { title, content }
    });
  }

  // TODO: add debug flag in settings
  public debug(...data) {
    console.log(...data);
  }

  // TODO: track the last X errors and display them in a modal (debug mode option)
  public error(...data) {
    console.error(...data);

    if (data.length === 1) this.showErrorWindow('New Caught Error', data[0]);
    if (data.length >= 2)  this.showErrorWindow(data[0], data[1]);
  }
}

@Injectable()
export class AlertErrorHandler implements ErrorHandler {

  constructor(private logger: LoggerService) {}

  handleError(error) {
    this.logger.error(error);
  }
}
