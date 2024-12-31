import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto, CloseChatDto } from '../dtos/chat.dto';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { Role } from 'src/roles/roles.enum';

@Controller('chat')
@UseGuards(AuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post(':orderId/message')
  async sendMessage(
    @Param('orderId') orderId: number,
    @Req() req: any,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    const { userId } = req.user;
    return this.chatService.sendMessage(
      orderId,
      userId,
      sendMessageDto.content,
    );
  }

  @Get(':orderId/messages')
  async getMessages(@Param('orderId') orderId: number, @Req() req: any) {
    const { userId } = req.user;
    return this.chatService.getMessages(orderId, userId);
  }

  @Patch(':orderId/close')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async closeChat(
    @Param('orderId') orderId: number,
    @Req() req: any,
    @Body() closeChatDto: CloseChatDto,
  ) {
    const adminId = req.user.userId;
    return this.chatService.closeChat(orderId, adminId, closeChatDto.summary);
  }
}
