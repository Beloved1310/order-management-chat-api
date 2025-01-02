import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { AuthGuard } from '../guards/auth.guard'
@Module({
  providers: [ChatService, ChatGateway, AuthGuard],
  controllers: [ChatController],
  exports: [ChatService], 
})
export class ChatModule {}
