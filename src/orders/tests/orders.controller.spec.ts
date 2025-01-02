import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from '../orders.controller';
import { OrdersService } from '../orders.service';
import { AuthGuard } from '../../guards/auth.guard';
import { RolesGuard } from '../../guards/roles.guard';

describe('OrdersController', () => {
  let controller: OrdersController;
  let ordersServiceMock: Partial<OrdersService>;

  beforeEach(async () => {
    // Mock the OrdersService
    ordersServiceMock = {
      createOrder: jest.fn(),
      getOrder: jest.fn(),
      updateOrderStatus: jest.fn(),
    };

    // Mock AuthGuard
    const authGuardMock = {
      canActivate: jest.fn(() => true),
    };

    // Mock RolesGuard
    const rolesGuardMock = {
      canActivate: jest.fn(() => true),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: ordersServiceMock,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(authGuardMock)
      .overrideGuard(RolesGuard)
      .useValue(rolesGuardMock)
      .compile();

    controller = module.get<OrdersController>(OrdersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
