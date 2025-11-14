import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UserRole } from '@app/common/enums/user-role.enum';

export const DynamicBody = createParamDecorator(
  async (dtoMap: Partial<Record<UserRole, any>>, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const role: UserRole = request.user?.role;
    const body = request.body;

    const dtoClass = dtoMap?.[role];
    if (!dtoClass) {
      throw new BadRequestException(`No DTO mapping found for role: ${role}`);
    }

    const dtoInstance = plainToInstance(dtoClass, body);
    const errors = await validate(dtoInstance);

    if (errors.length > 0) {
      const formattedErrors = errors.reduce((acc, err) => {
        acc[err.property] = Object.values(err.constraints || []).join(', ');
        return acc;
      }, {} as Record<string, string>);

      throw new BadRequestException({
        statusCode: 400,
        message: 'Validation failed',
        error: formattedErrors,
      });
    }

    return dtoInstance;
  },
);

