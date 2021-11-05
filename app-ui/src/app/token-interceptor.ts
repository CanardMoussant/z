import { Injectable, Injector, forwardRef } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';

import { AuthService } from './auth/auth.service';

import { CookieService } from 'ngx-cookie';
import { Observable } from 'rxjs';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private auth: AuthService;

  constructor(
    private injector: Injector,
    private cookieService: CookieService
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (!this.auth) {
      this.auth = this.injector.get(AuthService);
    }

    if (this.auth.isAuthenticated()) {
      request = request.clone({
        setHeaders: {
          'X-Auth-Token': this.auth.getToken(),
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Add CSRF token for the Play CSRF filter
    const token = this.cookieService.get('PLAY_CSRF_TOKEN');
    if (token) {
      // Play looks for a token with the name Csrf-Token
      // https://www.playframework.com/documentation/2.4.x/ScalaCsrf
      request = request.clone({
        setHeaders: {
          'Csrf-Token': token,
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    return next.handle(request);
  }
}
