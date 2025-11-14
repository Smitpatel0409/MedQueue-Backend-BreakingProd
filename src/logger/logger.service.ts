import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import * as util from 'util';
import chalk from 'chalk';

@Injectable()
export class AppLoggerService implements LoggerService {
  private readonly logger: winston.Logger;

  constructor() {
    const logLevel = process.env.NODE_ENV === 'production' ? 'error' : 'debug';

    this.logger = winston.createLogger({
      level: logLevel,
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, context, executionTime, ...meta }) => {
              // Format meta as a colorful key-value object
              const formattedMeta = meta && Object.keys(meta).length
                ? util.inspect(meta, { colors: true, depth: null })
                : '';

              return this.formatLog(timestamp, level, context, message, executionTime, formattedMeta);
            })
          ),
        }),
      ],
    });
  }
  /**
   * Formats the log message with timestamp, level, context, message, execution time, and metadata.
   * @param timestamp - The timestamp of the log.
   * @param level - The log level (e.g., info, error).
   * @param context - The context of the log (e.g., class or module name).
   * @param message - The log message.
   * @param executionTime - The execution time of the operation being logged.
   * @param meta - Additional metadata for the log.
   * @returns A formatted log string.
   */
  private formatLog(timestamp: any, level: string, context: any, message: any, executionTime: any | string, meta: any) {
    const levelColor = this.getLevelColor(level);

    return `${chalk.gray(timestamp)} [${levelColor(level.toUpperCase())}] [${chalk.cyan(context)}] ` +
           `${chalk.white(message)} (Execution Time: ${chalk.magenta(`${executionTime ?? 'N/A'}ms`)})\n${meta}`;
  }
  /**
   * Determines the color for the log level using Chalk.
   * @param level - The log level (e.g., info, error).
   * @returns A Chalk color function for the log level.
   */
  private getLevelColor(level: string) {
    switch (level.toLowerCase()) {
      case 'error': return chalk.red;
      case 'warn': return chalk.yellow;
      case 'info': return chalk.green;
      case 'debug': return chalk.blue;
      case 'verbose': return chalk.gray;
      default: return chalk.white;
    }
  }

  // private measureExecutionTime(start: number): number {
  //   return Date.now() - start;
  // }
   /**
   * Measures the execution time of an operation in milliseconds.
   * @param start - The high-resolution time at the start of the operation.
   * @returns The elapsed time in milliseconds as a string.
   */
  private measureExecutionTime(start: [number, number]): string {
    const diff = process.hrtime(start);
    const elapsedMs = (diff[0] * 1e3 + diff[1] / 1e6).toFixed(3); // Convert ns to ms
    return elapsedMs;
  }
/**
   * Logs a message at the "info" level.
   * @param message - The log message.
   * @param context - The context of the log (default: 'AppLogger').
   * @param meta - Additional metadata for the log.
   */

  log(message: string, context = 'AppLogger', meta: Record<string, any> = {}) {
    const start = process.hrtime();
    this.logger.info({ message, context, executionTime: this.measureExecutionTime(start), ...meta });
  }
 /**
   * Logs a message at the "error" level.
   * @param message - The log message.
   * @param trace - The stack trace (optional).
   * @param context - The context of the log (default: 'AppLogger').
   * @param meta - Additional metadata for the log.
   */
  error(message: string, trace = '', context = 'AppLogger', meta: Record<string, any> = {}) {
    const start = process.hrtime();
    this.logger.error({ message, trace, context, executionTime: this.measureExecutionTime(start), ...meta });
  }
 /**
   * Logs a message at the "warn" level.
   * @param message - The log message.
   * @param context - The context of the log (default: 'AppLogger').
   * @param meta - Additional metadata for the log.
   */
  warn(message: string, context = 'AppLogger', meta: Record<string, any> = {}) {
    const start = process.hrtime();
    this.logger.warn({ message, context, executionTime: this.measureExecutionTime(start), ...meta });
  }
/**
   * Logs a message at the "debug" level.
   * @param message - The log message.
   * @param context - The context of the log (default: 'AppLogger').
   * @param meta - Additional metadata for the log.
   */
  debug(message: string, context = 'AppLogger', meta: Record<string, any> = {}) {
    const start = process.hrtime();
    this.logger.debug({ message, context, executionTime: this.measureExecutionTime(start), ...meta });
  }
  /**
   * Logs a message at the "verbose" level.
   * @param message - The log message.
   * @param context - The context of the log (default: 'AppLogger').
   * @param meta - Additional metadata for the log.
   */
  verbose(message: string, context = 'AppLogger', meta: Record<string, any> = {}) {
    const start = process.hrtime();
    this.logger.verbose({ message, context, executionTime: this.measureExecutionTime(start), ...meta });
  }

}
