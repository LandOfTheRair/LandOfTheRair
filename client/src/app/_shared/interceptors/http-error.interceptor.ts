import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { APIService } from '../../services/api.service';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(private apiService: APIService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error && error.status >= 0) {
          this.apiService.setAPIError(error.message ?? 'Unknown error.');
        }

        return throwError(() => error);
      }),
    );
  }
}
