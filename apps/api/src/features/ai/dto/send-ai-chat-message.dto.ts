import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SendAiChatMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  content: string;
}
