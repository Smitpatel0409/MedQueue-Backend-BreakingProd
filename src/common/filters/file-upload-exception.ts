import { HttpException, HttpStatus } from '@nestjs/common';

export class FileUploadException extends HttpException {
  constructor(message: string, statusCode: HttpStatus = HttpStatus.BAD_REQUEST) {
    super(
      {
        success: false,
        statusCode,
        message,
      },
      statusCode,
    );
  }
}