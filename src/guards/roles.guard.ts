import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../common/enums/user-role.enum';
import { ROLES_KEY } from '@app/common/decorators/roles.decorator';
import { AppLoggerService } from '@app/logger/logger.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly logger: AppLoggerService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<UserRole[]>(
      ROLES_KEY,
      context.getHandler(),
    );

    if (!requiredRoles) return true; // No roles required, allow access

    let request;

    // Handle both HTTP and GraphQL
    if (context.getType() === 'http') {
      request = context.switchToHttp().getRequest();
    }

    const user = request.user;

    this.logger.log('User in RolesGuard:', 'RolesGuard', user);

    if (!user || !user.role) {
      throw new ForbiddenException(
        'Unauthorized: No user role found in request',
      );
    }
    console.log(user.role);
    // Ensure user.role is treated as an array
    const userRoles = Array.isArray(user.role) ? user.role : [user.role];
    console.log(userRoles);
    if (!userRoles.some((role) => requiredRoles.includes(role))) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    return true;
  }
}
