import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export interface Response<T> {
  data: T;
}

@Injectable()
export class ErrorInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      tap((val) => {
        if (val && !val.success && val.statusCode) {
          context.switchToHttp().getResponse().status(val.statusCode);
        }
      }),
    );
  }
}
