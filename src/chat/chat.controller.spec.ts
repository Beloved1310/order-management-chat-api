import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';

describe('ChatController', () => {
  let controller: ChatController;
  let chatServiceMock: Partial<ChatService>;

  beforeEach(async () => {
    // Mock ChatService
    chatServiceMock = {
      sendMessage: jest.fn(),
      getMessages: jest.fn(),
      closeChat: jest.fn(),
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
      controllers: [ChatController],
      providers: [
        {
          provide: ChatService,
          useValue: chatServiceMock,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(authGuardMock)
      .overrideGuard(RolesGuard)
      .useValue(rolesGuardMock)
      .compile();

    controller = module.get<ChatController>(ChatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
