import { ErrorHandler, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ErrorComponent } from '../_shared/modals/error/error.component';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  private ignoredErrorMessages = {
    'TypeError: Cannot read property \'sys\' of null': true,
    'Cannot read property \'sys\' of null': true,
    'TypeError: Cannot read property \'sys\' of undefined': true,
    'Cannot read property \'sys\' of undefined': true
  };

  private canShowErrors = true;

  constructor(
    private dialog: MatDialog
  ) {}

  public showErrorWindow(title: string, content: string) {
    if (this.ignoredErrorMessages[title] || this.ignoredErrorMessages[content] || !this.canShowErrors || !title || !content) return;

    this.dialog.afterAllClosed.subscribe(() => {
      this.canShowErrors = true;
    });

    this.canShowErrors = false;

    this.dialog.open(ErrorComponent, {
      width: '450px',
      panelClass: 'fancy',
      data: { title, content }
    });
  }

  public debug(...data) {
    console.log(...data);
  }

  public error(...data) {
    console.error(...data);

    /*
    if(data[0]?.message) {
      data[1] = data[0].message;
      data[0] = 'New Caught Error';
    }

    if(data[1]?.message) {
      data[0] = 'New Caught Error';
      data[1] = data[1].message;
    }

    if (data.length === 1) this.showErrorWindow('New Caught Error', data[0]);
    if (data.length >= 2)  this.showErrorWindow(data[0], data[1]);
    */
  }
}

@Injectable()
export class AlertErrorHandler implements ErrorHandler {

  constructor(private logger: LoggerService) {}

  handleError(error) {
    this.logger.error(error);
  }
}
