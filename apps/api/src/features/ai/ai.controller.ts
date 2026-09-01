import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { RequestUser } from '../../auth/request-user.decorator.js';
import { UserPrincipal } from '../../auth/user-principal.js';
import { AiService } from './ai.service.js';
import { AiAgentDto } from './dto/ai-agent.dto.js';
import { AiModelDto } from './dto/ai-model.dto.js';
import { AiProviderConnectionDto } from './dto/ai-provider-connection.dto.js';
import { CreateAiAgentDto } from './dto/create-ai-agent.dto.js';
import { CreateAiProviderConnectionDto } from './dto/create-ai-provider-connection.dto.js';
import { UpdateAiAgentDto } from './dto/update-ai-agent.dto.js';
import { UpdateAiProviderConnectionDto } from './dto/update-ai-provider-connection.dto.js';

@Controller('ai')
@ApiTags('AI')
@UseGuards(ThrottlerGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('provider-connections')
  @ApiOperation({ summary: 'List the current user’s AI provider connections' })
  @ApiResponse({ status: 200, type: [AiProviderConnectionDto] })
  async findProviderConnections(
    @RequestUser() user: UserPrincipal,
  ): Promise<AiProviderConnectionDto[]> {
    return await this.aiService.findProviderConnections(user.id);
  }

  // Stricter limit: this endpoint relays the submitted token to the external
  // provider for validation, so it could be abused as a token-validation oracle.
  @Post('provider-connections')
  @ApiOperation({ summary: 'Create an AI provider connection' })
  @ApiBody({ type: CreateAiProviderConnectionDto })
  @ApiResponse({ status: 201, type: AiProviderConnectionDto })
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  async createProviderConnection(
    @RequestUser() user: UserPrincipal,
    @Body() dto: CreateAiProviderConnectionDto,
  ): Promise<AiProviderConnectionDto> {
    return await this.aiService.createProviderConnection({
      userId: user.id,
      dto,
    });
  }

  // Stricter limit: replacement tokens are validated against the external
  // provider, same token-validation-oracle concern as the create endpoint.
  @Patch('provider-connections/:id')
  @ApiOperation({ summary: 'Update an AI provider connection' })
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'Provider connection ID',
  })
  @ApiBody({ type: UpdateAiProviderConnectionDto })
  @ApiResponse({ status: 200, type: AiProviderConnectionDto })
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  async updateProviderConnection(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAiProviderConnectionDto,
  ): Promise<AiProviderConnectionDto> {
    return await this.aiService.updateProviderConnection({
      userId: user.id,
      connectionId: id,
      dto,
    });
  }

  @Delete('provider-connections/:id')
  @ApiOperation({ summary: 'Delete an AI provider connection' })
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'Provider connection ID',
  })
  @ApiResponse({ status: 200, type: AiProviderConnectionDto })
  async deleteProviderConnection(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AiProviderConnectionDto> {
    return await this.aiService.deleteProviderConnection({
      userId: user.id,
      connectionId: id,
    });
  }

  // Each call makes an outbound request to the external provider.
  @Get('provider-connections/:id/models')
  @ApiOperation({
    summary: 'List models available from an AI provider connection',
  })
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'Provider connection ID',
  })
  @ApiResponse({ status: 200, type: [AiModelDto] })
  @Throttle({ default: { ttl: 60_000, limit: 30 } })
  async listModels(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AiModelDto[]> {
    return await this.aiService.listModels({
      userId: user.id,
      connectionId: id,
    });
  }

  @Get('agents')
  @ApiOperation({ summary: 'List the current user’s AI agents' })
  @ApiResponse({ status: 200, type: [AiAgentDto] })
  async findAgents(@RequestUser() user: UserPrincipal): Promise<AiAgentDto[]> {
    return await this.aiService.findAgents(user.id);
  }

  @Post('agents')
  @ApiOperation({ summary: 'Create an AI agent' })
  @ApiBody({ type: CreateAiAgentDto })
  @ApiResponse({ status: 201, type: AiAgentDto })
  @HttpCode(HttpStatus.CREATED)
  async createAgent(
    @RequestUser() user: UserPrincipal,
    @Body() dto: CreateAiAgentDto,
  ): Promise<AiAgentDto> {
    return await this.aiService.createAgent({ userId: user.id, dto });
  }

  @Patch('agents/:id')
  @ApiOperation({ summary: 'Update an AI agent' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'AI agent ID' })
  @ApiBody({ type: UpdateAiAgentDto })
  @ApiResponse({ status: 200, type: AiAgentDto })
  async updateAgent(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAiAgentDto,
  ): Promise<AiAgentDto> {
    return await this.aiService.updateAgent({
      userId: user.id,
      agentId: id,
      dto,
    });
  }

  @Delete('agents/:id')
  @ApiOperation({ summary: 'Delete an AI agent' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'AI agent ID' })
  @ApiResponse({ status: 200, type: AiAgentDto })
  async deleteAgent(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AiAgentDto> {
    return await this.aiService.deleteAgent({ userId: user.id, agentId: id });
  }
}
