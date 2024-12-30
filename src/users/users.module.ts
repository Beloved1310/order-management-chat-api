import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthGuard } from './auth.guard';
import { PrismaService } from 'src/prisma.service';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from 'src/roles/roles.guard';
@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  providers: [
    UsersService,
    PrismaService,
    // {
    //   provide: APP_GUARD,
    //   useClass: AuthGuard, // Global AuthGuard to run first
    // },
    // {
    //   provide: APP_GUARD,
    //   useClass: RolesGuard, // Global RolesGuard to run after AuthGuard
    // },
  ],
  controllers: [UsersController],
  exports: [UsersService]
})
export class UsersModule {}

