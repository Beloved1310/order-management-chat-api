import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';

@WebSocketGateway(3002, { cors: { origin: '*' },  })
export class ChatGateway {
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}
 // client: Socket,
  // orderId: number
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() orderId: number,
    @ConnectedSocket() client: Socket
  ) {
    try {
      if (!orderId) {
        this.logger.log('Order ID is missing or invalid...');
        throw new BadRequestException('Order ID must be a valid number.');
      }

      client.join(`order_${orderId}`);
      client.emit('joinedRoom', { orderId });
    } catch (error) {
      this.handleSocketError(client, error);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody()
    payload: { orderId: number; userId: number; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { orderId, userId, content } = payload;
  
      // Validate the payload
      if (!orderId || !userId || !content) {
        throw new BadRequestException(
          'Payload must include orderId, userId, and content.'
        );
      }

      if (typeof orderId !== 'number' || typeof userId !== 'number' || typeof content !== 'string') {
        throw new BadRequestException('Invalid payload types.');
      }

    
      // Save the message
      const message = await this.chatService.sendMessage(orderId, userId, content);

      // Broadcast to the room
      this.server.to(`order_${orderId}`).emit('newMessage', message);
    } catch (error) {
      this.handleSocketError(client, error);
    }
  }

  private handleSocketError(client: Socket, error: any) {
    const errorMessage = 
      error instanceof BadRequestException ? error.message :
      error instanceof InternalServerErrorException ? 'Internal server error occurred.' :
      'An unexpected error occurred.';
      this.logger.error('Error:', error.message || error);
    client.emit('error', { message: errorMessage });
  }
}
