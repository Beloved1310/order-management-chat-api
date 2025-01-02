import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    this.logger.log('AuthGuard execution started...');
    const request: Request = context.switchToHttp().getRequest();

    try {
      const token = this.extractTokenFromHeader(request);
      this.logger.debug(`Token received: ${token}`);

      if (!token) {
        this.logger.warn('No token provided in the Authorization header.');
        throw new UnauthorizedException('Token is missing.');
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      this.logger.debug(`Payload verified: ${JSON.stringify(payload)}`);

      request['user'] = payload; // Attach payload to the request object
      this.logger.log('AuthGuard execution successful.');

      return true;
    } catch (error) {
      this.logger.error('AuthGuard execution failed.', error.message);
      throw new UnauthorizedException('Invalid or expired token.');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type !== 'Bearer') {
      this.logger.warn('Invalid token type. Expected Bearer token.');
    }
    return type === 'Bearer' ? token : undefined;
  }
}
