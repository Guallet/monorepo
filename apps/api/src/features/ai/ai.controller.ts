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
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { RequestUser } from 'src/auth/request-user.decorator';
import { UserPrincipal } from 'src/auth/user-principal';
import { AiService } from './ai.service';
import { AiAgentDto } from './dto/ai-agent.dto';
import { AiModelDto } from './dto/ai-model.dto';
import { AiProviderConnectionDto } from './dto/ai-provider-connection.dto';
import { CreateAiAgentDto } from './dto/create-ai-agent.dto';
import { CreateAiProviderConnectionDto } from './dto/create-ai-provider-connection.dto';
import { UpdateAiAgentDto } from './dto/update-ai-agent.dto';
import { UpdateAiProviderConnectionDto } from './dto/update-ai-provider-connection.dto';

@Controller('ai')
@ApiTags('AI')
@UseGuards(ThrottlerGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @ApiOperation({ summary: 'findProviderConnections' })
  @ApiOkResponse({ type: () => AiProviderConnectionDto, isArray: true })
  @Get('provider-connections')
  async findProviderConnections(
    @RequestUser() user: UserPrincipal,
  ): Promise<AiProviderConnectionDto[]> {
    return await this.aiService.findProviderConnections(user.id);
  }

  // Stricter limit: this endpoint relays the submitted token to the external
  // provider for validation, so it could be abused as a token-validation oracle.
  @ApiOperation({ summary: 'createProviderConnection' })
  @ApiCreatedResponse({ type: () => AiProviderConnectionDto })
  @ApiBody({ type: () => CreateAiProviderConnectionDto })
  @Post('provider-connections')
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
  @ApiOperation({ summary: 'updateProviderConnection' })
  @ApiOkResponse({ type: () => AiProviderConnectionDto })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiBody({ type: () => UpdateAiProviderConnectionDto })
  @Patch('provider-connections/:id')
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  async updateProviderConnection(
    @RequestUser() user: UserPrincipal,
    @Param('id') id: string,
    @Body() dto: UpdateAiProviderConnectionDto,
  ): Promise<AiProviderConnectionDto> {
    return await this.aiService.updateProviderConnection({
      userId: user.id,
      connectionId: id,
      dto,
    });
  }

  @ApiOperation({ summary: 'deleteProviderConnection' })
  @ApiOkResponse({ type: () => AiProviderConnectionDto })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @Delete('provider-connections/:id')
  async deleteProviderConnection(
    @RequestUser() user: UserPrincipal,
    @Param('id') id: string,
  ): Promise<AiProviderConnectionDto> {
    return await this.aiService.deleteProviderConnection({
      userId: user.id,
      connectionId: id,
    });
  }

  // Each call makes an outbound request to the external provider.
  @ApiOperation({ summary: 'listModels' })
  @ApiOkResponse({ type: () => AiModelDto, isArray: true })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @Get('provider-connections/:id/models')
  @Throttle({ default: { ttl: 60_000, limit: 30 } })
  async listModels(
    @RequestUser() user: UserPrincipal,
    @Param('id') id: string,
  ): Promise<AiModelDto[]> {
    return await this.aiService.listModels({
      userId: user.id,
      connectionId: id,
    });
  }

  @ApiOperation({ summary: 'findAgents' })
  @ApiOkResponse({ type: () => AiAgentDto, isArray: true })
  @Get('agents')
  async findAgents(@RequestUser() user: UserPrincipal): Promise<AiAgentDto[]> {
    return await this.aiService.findAgents(user.id);
  }

  @ApiOperation({ summary: 'createAgent' })
  @ApiCreatedResponse({ type: () => AiAgentDto })
  @ApiBody({ type: () => CreateAiAgentDto })
  @Post('agents')
  @HttpCode(HttpStatus.CREATED)
  async createAgent(
    @RequestUser() user: UserPrincipal,
    @Body() dto: CreateAiAgentDto,
  ): Promise<AiAgentDto> {
    return await this.aiService.createAgent({ userId: user.id, dto });
  }

  @ApiOperation({ summary: 'updateAgent' })
  @ApiOkResponse({ type: () => AiAgentDto })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiBody({ type: () => UpdateAiAgentDto })
  @Patch('agents/:id')
  async updateAgent(
    @RequestUser() user: UserPrincipal,
    @Param('id') id: string,
    @Body() dto: UpdateAiAgentDto,
  ): Promise<AiAgentDto> {
    return await this.aiService.updateAgent({
      userId: user.id,
      agentId: id,
      dto,
    });
  }

  @ApiOperation({ summary: 'deleteAgent' })
  @ApiOkResponse({ type: () => AiAgentDto })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @Delete('agents/:id')
  async deleteAgent(
    @RequestUser() user: UserPrincipal,
    @Param('id') id: string,
  ): Promise<AiAgentDto> {
    return await this.aiService.deleteAgent({ userId: user.id, agentId: id });
  }
}
