import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction): void {
    const generateRequestLog = () => {
      const now = Date.now();
      return {
        userAgent: request.get('user-agent'),
        method: request.method,
        url: request.originalUrl,
        statusCode: response.statusCode,
        statusMessage: response.statusMessage,
        contentLength: response.get('content-length'),
        responseTime: Date.now() - now,
        contentType: request.get('content-type') || request.get('Content-type'),
        accept: request.get('accept'),
        ip: request.get('x-forwarded-for') || request.ip,
        timestamp: new Date().toISOString(),
      };
    };

    response.on('finish', () => {
      this.apiLog(generateRequestLog());
    });

    next();
  }

  private apiLog(message: object): void {
    const level = 'API_REQUEST';
    console.log(JSON.stringify({ level, ...message }));
  }
}
