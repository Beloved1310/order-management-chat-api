import { IsNotEmpty, IsString } from 'class-validator';

export class SendMessageDto {
  @IsNotEmpty()
  @IsString()
  content: string;
}

export class CloseChatDto {
  @IsNotEmpty()
  @IsString()
  summary: string;
}
