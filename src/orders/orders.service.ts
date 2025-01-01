import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto } from '../dtos/order.dto';
import { Role } from '../roles/roles.enum';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(user, createOrderDto: CreateOrderDto) {
    
    if (user.role !== Role.REGULAR) {
      throw new ForbiddenException('Only Regular Users can create orders');
    }

    const order = await this.prisma.order.create({
      data: {
        ...createOrderDto,
        userId: user.userId,
        chatRoom: {
          create: {}, // Automatically create a chat room for the order
        },
      },
      include: { chatRoom: true },
    });

    return order;
  }

  async getOrder(user, orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { chatRoom: { include: { messages: true } } },
    });

    if (!order) throw new NotFoundException('Order not found');

    if (user.role !== 'Admin' && order.userId !== user.userId) {
      throw new ForbiddenException('Access denied');
    }

    return order;
  }

  async updateOrderStatus(orderId: number, status: string) {
    const validStatuses = ['Processing', 'Completed'];
    if (!validStatuses.includes(status)) {
      throw new ForbiddenException('Invalid order status');
    }

    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    return order;
  }
}
