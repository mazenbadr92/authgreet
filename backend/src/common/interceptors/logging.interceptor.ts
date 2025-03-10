import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { SESSION_CONSTANTS } from '../config/constants';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const request = context.switchToHttp().getRequest();
    // Check if sessionId exists in request headers; if not, generate one.
    const sessionId =
      request.headers[SESSION_CONSTANTS.SESSION_ID_HEADER] || uuidv4();
    // Optionally, attach the sessionId to the request object for use in controllers/services.
    request.sessionId = sessionId;

    this.logger.log(
      `SessionId: ${sessionId} - ${request.method} ${request.url} - Incoming request`,
    );

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const elapsed = Date.now() - now;
        this.logger.log(
          `SessionId: ${sessionId} - ${request.method} ${request.url} - ${response.statusCode} ${elapsed}ms`,
        );
      }),
    );
  }
}
