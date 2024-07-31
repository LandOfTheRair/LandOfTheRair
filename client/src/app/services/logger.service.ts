import { ErrorHandler, Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { isString, sum } from 'lodash';
import Rollbar from 'rollbar';
import { environment } from '../../environments/environment';

import { ErrorComponent } from '../_shared/modals/error/error.component';

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  private loggedErrorMessages: Record<string, number> = {};
  private loggedErrors: Array<{ message: string; error: string }> = [];

  private ignoredErrorMessages = {
    "TypeError: Cannot read property 'sys' of null": true,
    "Cannot read property 'sys' of null": true,
    "TypeError: Cannot read property 'sys' of undefined": true,
    "Cannot read property 'sys' of undefined": true,
  };

  private canShowErrors = true;

  private rollbar: Rollbar;

  public get iterableErrors(): Array<{
    message: string;
    error: string;
    total: number;
  }> {
    return this.loggedErrors.map((err) => ({
      ...err,
      total: this.loggedErrorMessages[err.message],
    }));
  }

  public get totalErrors(): number {
    return sum(Object.values(this.loggedErrorMessages)) ?? 0;
  }

  private dialog = inject(MatDialog);

  public init() {
    if (environment.rollbar.token) {
      this.rollbar = new Rollbar({
        accessToken: environment.rollbar.token,
        captureUncaught: true,
        captureUnhandledRejections: true,
      });
    }
  }

  public showErrorWindow(title: string, content: string) {
    if (
      this.ignoredErrorMessages[title] ||
      this.ignoredErrorMessages[content] ||
      !this.canShowErrors ||
      !title ||
      !content
    ) {
      return;
    }

    this.dialog.afterAllClosed.subscribe(() => {
      this.canShowErrors = true;
    });

    this.canShowErrors = false;

    this.dialog.open(ErrorComponent, {
      width: '550px',
      panelClass: 'fancy',
      data: { title, content },
    });
  }

  public debug(...data) {
    console.log(...data);
  }

  public error(...data) {
    console.error(...data);

    let title = 'New Caught Error';
    let errorStack = 'Unknown Stack Trace';

    let error = data[0];

    if (isString(data[0])) {
      title = data[0];
      error = data[1];
    }

    if (error?.message) {
      title = `${title}: ${error.message}`;
    }

    if (error?.stack) errorStack = error.stack;

    this.logError(title, errorStack);
  }

  private logError(errorKey: string, stack: string): void {
    if (this.loggedErrorMessages[errorKey]) {
      this.loggedErrorMessages[errorKey]++;
      return;
    }

    this.loggedErrorMessages[errorKey] = 1;
    this.loggedErrors.push({ message: errorKey, error: stack });

    // this.showErrorWindow(message, error);
  }

  public rollbarError(error) {
    this.rollbar?.error(error.originalError || error);
  }
}

@Injectable()
export class AlertErrorHandler implements ErrorHandler {
  private logger = inject(LoggerService);

  constructor() {}

  handleError(error) {
    this.logger.error(error);
    this.logger.rollbarError(error);
  }
}
