import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  constructor() { }

  // TODO: add debug flag in settings
  public debug(...data) {
    console.log(...data);
  }

  // TODO: track the last X errors and display them in a modal (debug mode option)
  public error(...data) {
    console.error(...data);
  }
}
