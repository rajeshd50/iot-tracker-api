/* eslint-disable prettier/prettier */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class GlobalExceptionsFilter implements ExceptionFilter {
  private logger = new Logger(GlobalExceptionsFilter.name);
  catch(exception: unknown, host: ArgumentsHost) {
    this.logger.log(exception);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const data =
      exception instanceof HttpException ? exception.getResponse() : null;
    this.logger.log(`Exception caught! ${status} ${request.url}`);
    if (response) {
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        data,
      });
    }
  }
}
