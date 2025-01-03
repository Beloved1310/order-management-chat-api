import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from '../dtos/order.dto';
import { Role } from '../roles/roles.enum';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  // Helper function to check if user has access to the order
  private async checkOrderAccess(user, orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (user.role !== Role.ADMIN && order.userId !== user.userId) {
      throw new ForbiddenException('Access denied');
    }

    return order;
  }

  // Create an order for a regular user
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

  // Get order details with its chat room and messages
  async getOrder(user, orderId: number) {
    const order = await this.checkOrderAccess(user, orderId);

    return this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        chatRoom: { 
          include: { messages: true } 
        },
      },
    });
  }

  // Update the order status
  async updateOrderStatus(orderId: number, status: string) {
    const validStatuses = ['Processing', 'Completed'];
    if (!validStatuses.includes(status)) {
      throw new ForbiddenException('Invalid order status');
    }

    // Check if the order exists
    const existingOrder = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // Update the order status
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    return updatedOrder;
  }
}
