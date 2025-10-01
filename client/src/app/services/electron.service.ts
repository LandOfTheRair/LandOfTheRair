import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ElectronService {
  public isInElectron() {
    return navigator.userAgent.toLowerCase().includes(' electron/');
  }
}
