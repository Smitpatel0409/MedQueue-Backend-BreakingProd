import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { FastifyReply } from 'fastify';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const status = exception.getStatus();
    const error = exception.getResponse();

    console.log('HTTP Exception Caught:', {
      status,
      response: error,
    });

    // Construct the response object
    const responseBody = {
      status: 'error',
      statusCode: status,
      message: typeof error === 'object' ? (error as any).message : exception.message,
      error: typeof error === 'object' ? (error as any).error || exception.name : exception.message,
      timestamp: new Date().toISOString(),
    };
    console.log('Sending HTTP Error Response:', responseBody);

    response.status(status).send(responseBody);
  }
}
