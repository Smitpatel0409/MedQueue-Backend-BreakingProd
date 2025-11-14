import { Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import chalk from 'chalk'; // For color output
import { performance } from 'perf_hooks';
import { AppLoggerService } from '@app/logger/logger.service';

@Injectable()
export class CustomLoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: AppLoggerService){}
   /**
   * Middleware function to log details of incoming requests and outgoing responses.
   * Measures the execution time of the request and logs it along with the status code.
   * @param req - The incoming Fastify request object.
   * @param res - The outgoing Fastify response object.
   * @param next - The next middleware function in the pipeline.
   */
  use(req: FastifyRequest, res: FastifyReply, next: () => void) {
    const start = performance.now(); // Start measuring time
    const duration = (performance.now() - start).toFixed(3); // Execution time in ms
    const statusCode = res.statusCode;
    const statusColor = this.getStatusColor(statusCode);
    // console.log(
    //   `[Request] ${req.method} ${req.originalUrl} ` +
    //   `- ${statusCode.toString()} ` +
    //   `- ${duration } ms`
    // );
    this.logger.log(
      `${chalk.blue('[Request]')} ${chalk.cyan(req.method)} ${chalk.yellow(req.originalUrl)} ` +
      `- ${statusColor(statusCode.toString())} ` +
      `- ${chalk.magenta(`${duration} ms`)}`, 'Middleware', {url: req.originalUrl,method: req.method, statusCode, duration}
          );

    next();
  }
/**
   * Determines the color to use for logging based on the HTTP status code.
   * @param statusCode - The HTTP status code of the response.
   * @returns A Chalk color function corresponding to the status code category.
   */
  private getStatusColor(statusCode: number) {
    if (statusCode >= 500) return chalk.red; // Server errors (5xx)
    if (statusCode >= 400) return chalk.yellow; // Client errors (4xx)
    if (statusCode >= 300) return chalk.blue; // Redirects (3xx)
    if (statusCode >= 200) return chalk.green; // Success (2xx)
    return chalk.white; // Default
  }
}
