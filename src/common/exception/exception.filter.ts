import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const errorResponse = exception.getResponse() as Object;

    console.log(
      JSON.stringify({
        url: request.url,
        ip: request.get('x-forwarded-for') || request.ip,
        ...errorResponse,
      }),
    );

    response.status(status).json(exception.getResponse());
  }
}
