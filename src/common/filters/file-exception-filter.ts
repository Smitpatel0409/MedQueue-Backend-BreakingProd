import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { FastifyReply } from 'fastify';

@Catch()
export class FileUploadExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();
    
    // Default error structure
    let status = 500;
    let response = {
      success: false,
      statusCode: status,
      message: 'Internal server error',
      error: 'An unexpected error occurred while processing your request',
      timestamp: new Date().toISOString(),
    };
    
    // If this is a known HTTP exception
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object') {
        response = {
          ...response,
          ...exceptionResponse,
          statusCode: status,
        };
      } else {
        response.message = exceptionResponse;
      }
    } else if (exception instanceof Error) {
      // Handle multer/file system errors
      if (exception.name === 'MulterError') {
        status = 400;
        response.statusCode = status;
        
        switch ((exception as any).code) {
          case 'LIMIT_FILE_SIZE':
            response.message = 'File size exceeds the maximum limit (10MB)';
            response.error = 'LIMIT_FILE_SIZE';
            break;
          case 'LIMIT_FILE_COUNT':
            response.message = 'Too many files uploaded. Maximum is 10 files';
            response.error = 'LIMIT_FILE_COUNT';
            break;
          case 'LIMIT_UNEXPECTED_FILE':
            response.message = 'Unexpected field in form data';
            response.error = 'LIMIT_UNEXPECTED_FILE';
            break;
          default:
            response.message = 'Error uploading file';
            response.error = (exception as any).code;
        }
      } else if (exception.message.includes('ENOSPC')) {
        // Disk space error
        status = 500;
        response.message = 'Server storage is full';
        response.error = 'DISK_STORAGE_ERROR';
      } else if (exception.message.includes('EACCES')) {
        // Permission error
        status = 500;
        response.message = 'Permission denied when accessing upload directory';
        response.error = 'PERMISSION_ERROR';
      } else {
        // Generic error with message
        response.message = exception.message || 'An unexpected error occurred';
        response.error = exception.name || 'UNKNOWN_ERROR';
      }
    }
    
    return reply.status(status).send(response);
  }
}