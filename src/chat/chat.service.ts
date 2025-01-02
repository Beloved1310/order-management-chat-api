import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../roles/roles.enum';
@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async sendMessage(orderId: number, userId: number, content: string) {
    const chatRoom = await this.prisma.chatRoom.findUnique({
      where: { orderId },
    });

    if (!chatRoom) throw new NotFoundException('Chat room not found');
    if (chatRoom.closed) throw new ForbiddenException('Chat room is closed');

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order || (order.userId !== userId && !chatRoom)) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.message.create({
      data: {
        content,
        senderId: userId,
        chatRoomId: chatRoom.id,
      },
    });
  }

  async getMessages(orderId: number, userId: number) {
    const chatRoom = await this.prisma.chatRoom.findUnique({
      where: { orderId },
      include: {
        messages: {
          include: {
            sender: { select: { id: true, email: true } }, // Populate sender details
          },
        },
      },
    });

    if (!chatRoom) throw new NotFoundException('Chat room not found');
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || (order.userId !== userId && !chatRoom)) {
      throw new ForbiddenException('Access denied');
    }

    return chatRoom.messages;
  }

  async closeChat(orderId: number, adminId: number, summary: string) {
    const chatRoom = await this.prisma.chatRoom.findUnique({
      where: { orderId },
    });

    if (!chatRoom) throw new NotFoundException('Chat room not found');
    if (chatRoom.closed)
      throw new ForbiddenException('Chat room is already closed');

    // Only admins can close the chat
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!admin || admin.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can close chat rooms');
    }

    return this.prisma.chatRoom.update({
      where: { id: chatRoom.id },
      data: {
        closed: true,
        summary,
      },
    });
  }

  async getChatHistory(orderId: number) {
    return this.prisma.chatRoom.findMany({
      where: { orderId },
      select: {
        summary: true,
        orderId: true,
        messages: true,
      },
    });
  }
}
