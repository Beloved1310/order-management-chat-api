import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { PrismaService } from '../prisma/prisma.service';
import { ForbiddenException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { Role } from '../roles/roles.enum';

describe('ChatService', () => {
  let chatService: ChatService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatService, PrismaService],
    }).compile();

    chatService = module.get<ChatService>(ChatService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('sendMessage', () => {
    it('should throw ForbiddenException if user is not authorized to access the order', async () => {
      const orderId = 1;
      const userId = 2;  // Unauthorized user

      prismaService.chatRoom.findUnique = jest.fn().mockResolvedValue({
        id: 1,
        orderId: 1,
        closed: false,
      });

      prismaService.order.findUnique = jest.fn().mockResolvedValue({
        id: 1,
        userId: 1,  // Order belongs to a different user
      });

      await expect(chatService.sendMessage(orderId, userId, 'Message content')).rejects.toThrow(ForbiddenException);
    });
    it('should send a message successfully', async () => {
      const orderId = 1;
      const userId = 1;
      const content = 'Hello, this is a message';
      
      prismaService.chatRoom.findUnique = jest.fn().mockResolvedValue({
        id: 1,
        orderId: 1,
        closed: false,
      });

      prismaService.order.findUnique = jest.fn().mockResolvedValue({
        id: 1,
        userId: 1,
      });

      prismaService.message.create = jest.fn().mockResolvedValue({
        id: 1,
        content,
        senderId: userId,
        chatRoomId: 1,
      });

      const result = await chatService.sendMessage(orderId, userId, content);

      expect(result).toEqual({
        id: 1,
        content,
        senderId: userId,
        chatRoomId: 1,
      });
      expect(prismaService.message.create).toHaveBeenCalledWith({
        data: { content, senderId: userId, chatRoomId: 1 },
      });
    });

    it('should throw ForbiddenException if chat room is closed', async () => {
      const orderId = 1;
      const userId = 1;
      const content = 'Message content';

      prismaService.chatRoom.findUnique = jest.fn().mockResolvedValue({
        id: 1,
        orderId: 1,
        closed: true,
      });

      await expect(chatService.sendMessage(orderId, userId, content)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getMessages', () => {
    it('should retrieve messages successfully', async () => {
      const orderId = 1;
      const userId = 1;

      prismaService.chatRoom.findUnique = jest.fn().mockResolvedValue({
        id: 1,
        orderId: 1,
        closed: false,
        messages: [
          { content: 'Message 1', sender: { id: 1, email: 'user@example.com' } },
          { content: 'Message 2', sender: { id: 1, email: 'user@example.com' } },
        ],
      });

      prismaService.order.findUnique = jest.fn().mockResolvedValue({
        id: 1,
        userId: 1,
      });

      const result = await chatService.getMessages(orderId, userId);

      expect(result).toEqual([
        { content: 'Message 1', sender: { id: 1, email: 'user@example.com' } },
        { content: 'Message 2', sender: { id: 1, email: 'user@example.com' } },
      ]);
    });
  });

  describe('closeChat', () => {
    it('should close the chat room successfully', async () => {
      const orderId = 1;
      const adminId = 1;
      const summary = 'Chat summary';

      prismaService.chatRoom.findUnique = jest.fn().mockResolvedValue({
        id: 1,
        orderId: 1,
        closed: false,
      });

      prismaService.user.findUnique = jest.fn().mockResolvedValue({
        id: 1,
        role: Role.ADMIN,
      });

      prismaService.chatRoom.update = jest.fn().mockResolvedValue({
        id: 1,
        closed: true,
        summary,
      });

      const result = await chatService.closeChat(orderId, adminId, summary);

      expect(result).toEqual({ id: 1, closed: true, summary });
      expect(prismaService.chatRoom.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { closed: true, summary },
      });
    });

    it('should throw ForbiddenException if chat room is already closed', async () => {
      const orderId = 1;
      const adminId = 1;
      const summary = 'Chat summary';

      prismaService.chatRoom.findUnique = jest.fn().mockResolvedValue({
        id: 1,
        orderId: 1,
        closed: true,
      });

      await expect(chatService.closeChat(orderId, adminId, summary)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if user is not an admin', async () => {
      const orderId = 1;
      const adminId = 2;  // Non-admin user
      const summary = 'Chat summary';

      prismaService.chatRoom.findUnique = jest.fn().mockResolvedValue({
        id: 1,
        orderId: 1,
        closed: false,
      });

      prismaService.user.findUnique = jest.fn().mockResolvedValue({
        id: 2,
        role: Role.REGULAR,  // Non-admin user
      });

      await expect(chatService.closeChat(orderId, adminId, summary)).rejects.toThrow(ForbiddenException);
    });
  });
});
