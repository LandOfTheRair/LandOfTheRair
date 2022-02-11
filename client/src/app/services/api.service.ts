import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class APIService {

  public get overrideAPIURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('apiUrl');
  }

  public get overrideAPIUser() {
    const params = new URLSearchParams(window.location.search);
    return { username: params.get('username'), password: params.get('password') };
  }

  public get finalWSURL(): string {
    if (this.overrideAPIURL) {
      return `ws://${this.overrideAPIURL}`;
    }

    return environment.server.ws;
  }

  public get finalHTTPURL(): string {
    if (this.overrideAPIURL) {
      return `http://${this.overrideAPIURL}`;
    }

    return environment.server.http;
  }
}
