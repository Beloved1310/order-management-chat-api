import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Role } from '../roles/roles.enum';

jest.mock('../prisma/prisma.service', () => {
  return {
    PrismaService: jest.fn().mockImplementation(() => ({
      order: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    })),
  };
});

describe('OrdersService Integration Tests', () => {
  let ordersService: OrdersService;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrdersService, PrismaService],
    }).compile();

    ordersService = module.get<OrdersService>(OrdersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('createOrder', () => {
    it('should create an order successfully for a regular user', async () => {
      const user = { userId: 1, role: Role.REGULAR };
      const createOrderDto = {
        description: 'Order for custom furniture',
        specifications: 'Wooden table, dimensions 5x3 feet, varnished',
        quantity: 2,
        metadata: {
          material: 'Oak wood',
          priority: 'High',
          deliveryDate: '2024-01-15',
        },
      };

      // Mock Prisma call for order creation
      prismaService.order.create = jest.fn().mockResolvedValue({
        id: 1,
        ...createOrderDto,
        userId: user.userId,
        chatRoom: { id: 1 },
      });

      const result = await ordersService.createOrder(user, createOrderDto);
      expect(result).toEqual({
        id: 1,
        ...createOrderDto,
        userId: user.userId,
        chatRoom: { id: 1 },
      });
      expect(prismaService.order.create).toHaveBeenCalledWith({
        data: {
          ...createOrderDto,
          userId: user.userId,
          chatRoom: { create: {} },
        },
        include: { chatRoom: true },
      });
    });

    it('should throw ForbiddenException if user is not a regular user', async () => {
      const user = { userId: 2, role: Role.ADMIN };
      const createOrderDto = {
        description: 'Order for custom furniture',
        specifications: 'Wooden table, dimensions 5x3 feet, varnished',
        quantity: 2,
        metadata: {
          material: 'Oak wood',
          priority: 'High',
          deliveryDate: '2024-01-15',
        },
      };

      await expect(
        ordersService.createOrder(user, createOrderDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw InternalServerErrorException on failure', async () => {
      const user = { userId: 1, role: Role.REGULAR };
      const createOrderDto = {
        description: 'Order for custom furniture',
        specifications: 'Wooden table, dimensions 5x3 feet, varnished',
        quantity: 2,
        metadata: {
          material: 'Oak wood',
          priority: 'High',
          deliveryDate: '2024-01-15',
        },
      };
      prismaService.order.create = jest
        .fn()
        .mockRejectedValue(new InternalServerErrorException('Database error'));

      await expect(
        ordersService.createOrder(user, createOrderDto),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getOrder', () => {
    it('should retrieve an order successfully for the user', async () => {
      const user = { userId: 1, role: Role.REGULAR };
      const orderId = 1;
      const order = {
        id: orderId,
        userId: user.userId,
        item: 'Product 1',
        quantity: 2,
        totalPrice: 200,
        chatRoom: { id: 1, messages: [] },
      };

      prismaService.order.findUnique = jest.fn().mockResolvedValue(order);

      const result = await ordersService.getOrder(user, orderId);
      expect(result).toEqual(order);
    });

    it('should throw NotFoundException if order does not exist', async () => {
      const user = { userId: 1, role: Role.REGULAR };
      const orderId = 999;

      prismaService.order.findUnique = jest.fn().mockResolvedValue(null);

      await expect(ordersService.getOrder(user, orderId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw ForbiddenException if user tries to access someone else's order", async () => {
      const user = { userId: 2, role: Role.REGULAR };
      const orderId = 1;
      const order = {
        id: orderId,
        userId: 1,
        item: 'Product 1',
        quantity: 2,
        totalPrice: 200,
        chatRoom: { id: 1, messages: [] },
      };

      prismaService.order.findUnique = jest.fn().mockResolvedValue(order);

      await expect(ordersService.getOrder(user, orderId)).rejects.toThrow(
        ForbiddenException,
      );
    });
    it('should throw InternalServerErrorException on failure', async () => {
      const user = { userId: 1, role: Role.REGULAR };
      const orderId = 1;

      // Mock PrismaService to throw an error
      jest
        .spyOn(prismaService.order, 'findUnique')
        .mockRejectedValue(new InternalServerErrorException('Database error'));

      // Test that the exception is thrown
      await expect(ordersService.getOrder(user, orderId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('updateOrderStatus', () => {
    it('should update the order status successfully', async () => {
      const orderId = 1;
      const status = 'Completed';
      prismaService.order.findUnique = jest.fn().mockResolvedValue({
        id: orderId,
        status: 'Processing',
      });

      prismaService.order.update = jest.fn().mockResolvedValue({
        id: orderId,
        status,
      });

      const result = await ordersService.updateOrderStatus(orderId, status);
      expect(result.status).toBe(status);
      expect(prismaService.order.update).toHaveBeenCalledWith({
        where: { id: orderId },
        data: { status },
      });
    });

    it('should throw ForbiddenException if status is invalid', async () => {
      const orderId = 1;
      const status = 'InvalidStatus';

      await expect(
        ordersService.updateOrderStatus(orderId, status),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw InternalServerErrorException on failure', async () => {
      const orderId = 1;
      const status = 'Completed';

      prismaService.order.update = jest
        .fn()
        .mockRejectedValue(new InternalServerErrorException('Database error'));

      await expect(
        ordersService.updateOrderStatus(orderId, status),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
