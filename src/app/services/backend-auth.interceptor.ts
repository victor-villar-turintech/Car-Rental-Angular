import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BackendAuthService } from './backend-auth.service';
import { environment } from 'src/environments/environment';

/**
 * Attaches the JWT bearer token to outgoing requests targeted at the NestJS backend.
 * No-op when `environment.useBackend === false` or when no token is stored.
 */
@Injectable()
export class BackendAuthInterceptor implements HttpInterceptor {
  constructor(private readonly auth: BackendAuthService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!environment.useBackend) {
      return next.handle(req);
    }
    if (!req.url.startsWith(environment.backendUrl)) {
      return next.handle(req);
    }
    const token = this.auth.readToken();
    if (!token) {
      return next.handle(req);
    }
    return next.handle(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
  }
}
