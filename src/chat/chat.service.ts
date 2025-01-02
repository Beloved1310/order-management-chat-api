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

  // Helper function to check user access to chat room
  private async checkAccess(orderId: number, userId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
  }

  // Send a message to the chat room
  async sendMessage(orderId: number, userId: number, content: string) {
    const chatRoom = await this.prisma.chatRoom.findUnique({
      where: { orderId },
    });

    if (!chatRoom) throw new NotFoundException('Chat room not found');
    if (chatRoom.closed) throw new ForbiddenException('Chat room is closed');

    // Check if user has access to the order and chat room
    await this.checkAccess(orderId, userId);

    return this.prisma.message.create({
      data: {
        content,
        senderId: userId,
        chatRoomId: chatRoom.id,
      },
    });
  }

  // Get messages from the chat room
  async getMessages(orderId: number, userId: number) {
    const chatRoom = await this.prisma.chatRoom.findUnique({
      where: { orderId },
      include: {
        messages: {
          include: {
            sender: { select: { id: true, email: true } }, // Populate sender details
          },
        },
        order: true, // Include order data
      },
    });

    if (!chatRoom) throw new NotFoundException('Chat room not found');

    // Check if user has access to the order and chat room
    await this.checkAccess(orderId, userId);

    return chatRoom.messages;
  }

  // Close a chat room (only accessible by admin)
  async closeChat(orderId: number, adminId: number, summary: string) {
    // Fetch the chat room and associated order in one query
    const chatRoom = await this.prisma.chatRoom.findUnique({
      where: { orderId },
      include: { order: true }, // Include related order data
    });
  
    if (!chatRoom) throw new NotFoundException('Chat room not found');
    if (chatRoom.closed) throw new ForbiddenException('Chat room is already closed');
  
    // Validate admin role
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
    });
  
    if (!admin || admin.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can close chat rooms');
    }
  
    // Ensure the order exists before proceeding
    if (!chatRoom.order) {
      throw new NotFoundException('Associated order not found');
    }
  
    // Perform updates in a transaction
    return this.prisma.$transaction([
      // Update the order status
      this.prisma.order.update({
        where: { id: chatRoom.order.id },
        data: { status: 'Processing' },
      }),
      // Close the chat room
      this.prisma.chatRoom.update({
        where: { id: chatRoom.id },
        data: {
          closed: true,
          summary,
        },
      }),
    ]);
  }
  

  // Get chat history for an order
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
