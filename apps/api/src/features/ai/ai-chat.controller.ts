import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import type { Response } from 'express';
import { RequestUser } from '../../auth/request-user.decorator.js';
import { UserPrincipal } from '../../auth/user-principal.js';
import { AiChatService } from './ai-chat.service.js';
import { AiChatMessageDto } from './dto/ai-chat-message.dto.js';
import { AiChatSessionDto } from './dto/ai-chat-session.dto.js';
import { CreateAiChatSessionDto } from './dto/create-ai-chat-session.dto.js';
import { SendAiChatMessageDto } from './dto/send-ai-chat-message.dto.js';

@Controller('ai/chat')
@ApiTags('AI')
@UseGuards(ThrottlerGuard)
export class AiChatController {
  constructor(private readonly aiChatService: AiChatService) {}

  @Get('sessions')
  async findSessions(
    @RequestUser() user: UserPrincipal,
  ): Promise<AiChatSessionDto[]> {
    return await this.aiChatService.findSessions(user.id);
  }

  @Post('sessions')
  @HttpCode(HttpStatus.CREATED)
  async createSession(
    @RequestUser() user: UserPrincipal,
    @Body() dto: CreateAiChatSessionDto,
  ): Promise<AiChatSessionDto> {
    return await this.aiChatService.createSession({
      userId: user.id,
      agentId: dto.agentId,
    });
  }

  @Delete('sessions/:id')
  async deleteSession(
    @RequestUser() user: UserPrincipal,
    @Param('id') id: string,
  ): Promise<AiChatSessionDto> {
    return await this.aiChatService.deleteSession({
      userId: user.id,
      sessionId: id,
    });
  }

  @Get('sessions/:id/messages')
  async findMessages(
    @RequestUser() user: UserPrincipal,
    @Param('id') id: string,
  ): Promise<AiChatMessageDto[]> {
    return await this.aiChatService.findMessages({
      userId: user.id,
      sessionId: id,
    });
  }

  // Streams the assistant reply as plain text chunks. Each call makes an
  // outbound request to the user's AI provider, hence the stricter limit.
  @Post('sessions/:id/messages')
  @Throttle({ default: { ttl: 60_000, limit: 20 } })
  async sendMessage(
    @RequestUser() user: UserPrincipal,
    @Param('id') id: string,
    @Body() dto: SendAiChatMessageDto,
    @Res() response: Response,
  ): Promise<void> {
    const result = await this.aiChatService.streamReply({
      userId: user.id,
      sessionId: id,
      content: dto.content,
    });

    result.pipeTextStreamToResponse(response);
  }
}
