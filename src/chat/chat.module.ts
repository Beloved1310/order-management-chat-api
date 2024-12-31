import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { PrismaService } from '../../prisma/prisma.service'; 
import { AuthGuard } from '../guards/auth.guard'
@Module({
  providers: [ChatService, ChatGateway, AuthGuard, PrismaService],
  controllers: [ChatController],
  exports: [ChatService], 
})
export class ChatModule {}
