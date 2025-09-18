import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

interface ErrorResponse {
  message?: string;
  errors?: unknown;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: unknown = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as ErrorResponse;
        message = responseObj.message || exception.message;
        errors = responseObj.errors || null;
      } else {
        message = exceptionResponse;
      }
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      message,
      ...(errors ? { errors } : {}),
    };

    response.status(status).json(errorResponse);
  }
}
