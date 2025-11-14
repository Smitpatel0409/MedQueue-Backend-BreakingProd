import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppLoggerService } from '@app/logger/logger.service';
import { IS_PUBLIC_KEY } from '@app/common/decorators/public.decorator';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '@app/database/postgres/prisma/prisma.service';
import { RedisService } from '@app/database/redis/redis.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly logger: AppLoggerService,
    private readonly reflector: Reflector,
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let request: any;
    const isPublic = this.reflector.get<boolean>(
      IS_PUBLIC_KEY,
      context.getHandler(),
    );

    if (isPublic) {
      return true; // Allow public routes
    }

    // Handle HTTP and GraphQL requests
    if (context.getType() === 'http') {
      request = context.switchToHttp().getRequest();
    }

    // Allow Prometheus metrics endpoint without authentication
    if (request.url === '/metrics') {
      return true;
    }

    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid token');
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded: any = await this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      if(decoded.purpose==="refreshToken"){
        throw new UnauthorizedException("Invalid token or expired token")
      }
      this.logger.log('Decoded Token:', 'JwtAuthGuard', decoded);
      request.user = decoded;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
