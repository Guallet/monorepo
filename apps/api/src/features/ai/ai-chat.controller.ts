import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  ParseUUIDPipe,
  Res,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
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
export class AiChatController {
  constructor(private readonly aiChatService: AiChatService) {}

  @Get('sessions')
  @ApiOperation({ summary: 'List the current user’s AI chat sessions' })
  @ApiResponse({ status: 200, type: [AiChatSessionDto] })
  async findSessions(
    @RequestUser() user: UserPrincipal,
  ): Promise<AiChatSessionDto[]> {
    return await this.aiChatService.findSessions(user.id);
  }

  @Post('sessions')
  @ApiOperation({ summary: 'Create an AI chat session' })
  @ApiBody({ type: CreateAiChatSessionDto })
  @ApiResponse({ status: 201, type: AiChatSessionDto })
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
  @ApiOperation({ summary: 'Delete an AI chat session' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Chat session ID' })
  @ApiResponse({ status: 200, type: AiChatSessionDto })
  async deleteSession(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AiChatSessionDto> {
    return await this.aiChatService.deleteSession({
      userId: user.id,
      sessionId: id,
    });
  }

  @Get('sessions/:id/messages')
  @ApiOperation({ summary: 'List messages in an AI chat session' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Chat session ID' })
  @ApiResponse({ status: 200, type: [AiChatMessageDto] })
  async findMessages(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AiChatMessageDto[]> {
    return await this.aiChatService.findMessages({
      userId: user.id,
      sessionId: id,
    });
  }

  // Streams the assistant reply as plain text chunks. Each call makes an
  // outbound request to the user's AI provider.
  @Post('sessions/:id/messages')
  @ApiOperation({ summary: 'Send a message and stream the AI response' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Chat session ID' })
  @ApiBody({ type: SendAiChatMessageDto })
  @ApiResponse({
    status: 200,
    description: 'Plain-text response stream',
    content: {
      'text/plain': {
        schema: { type: 'string' },
      },
    },
  })
  async sendMessage(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
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
