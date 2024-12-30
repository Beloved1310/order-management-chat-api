import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaService } from '../../prisma/prisma.service'; 
import { AuthGuard } from '../guards/auth.guard'
@Module({
  controllers: [OrdersController],
  providers: [OrdersService, PrismaService, AuthGuard], 
  exports: [OrdersService], 
})
export class OrdersModule {}
