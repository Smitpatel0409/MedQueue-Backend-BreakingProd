// success-response.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SuccessResponse<T> {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiPropertyOptional()
  data?: T;

  @ApiProperty({ example: Date.now() })
  timestamp: number;

  constructor(statusCode: number, message: string, data?: T) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.timestamp = Date.now();
  }
}