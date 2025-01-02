import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { AuthGuard } from '../guards/auth.guard';
@Module({
  controllers: [OrdersController],
  providers: [OrdersService, AuthGuard],
  exports: [OrdersService],
})
export class OrdersModule {}
