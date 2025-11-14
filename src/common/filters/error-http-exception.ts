// src/common/exceptions/app-http.exception.ts

import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorResponse } from '../constants/error-response.util';

export class GlobalHttpException<T = any> extends HttpException {
  constructor(
    statusCode: HttpStatus,
    message: string,
    errorDetails?: T
  ) {
    super(new ErrorResponse<T>(statusCode, message, errorDetails), statusCode);
  }
}
