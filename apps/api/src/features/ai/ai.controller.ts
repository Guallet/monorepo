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
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
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
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('provider-connections')
  async findProviderConnections(
    @RequestUser() user: UserPrincipal,
  ): Promise<AiProviderConnectionDto[]> {
    return await this.aiService.findProviderConnections(user.id);
  }

  @Post('provider-connections')
  @HttpCode(HttpStatus.CREATED)
  async createProviderConnection(
    @RequestUser() user: UserPrincipal,
    @Body() dto: CreateAiProviderConnectionDto,
  ): Promise<AiProviderConnectionDto> {
    return await this.aiService.createProviderConnection({
      userId: user.id,
      dto,
    });
  }

  @Patch('provider-connections/:id')
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

  @Get('provider-connections/:id/models')
  async listModels(
    @RequestUser() user: UserPrincipal,
    @Param('id') id: string,
  ): Promise<AiModelDto[]> {
    return await this.aiService.listModels({
      userId: user.id,
      connectionId: id,
    });
  }

  @Get('agents')
  async findAgents(@RequestUser() user: UserPrincipal): Promise<AiAgentDto[]> {
    return await this.aiService.findAgents(user.id);
  }

  @Post('agents')
  @HttpCode(HttpStatus.CREATED)
  async createAgent(
    @RequestUser() user: UserPrincipal,
    @Body() dto: CreateAiAgentDto,
  ): Promise<AiAgentDto> {
    return await this.aiService.createAgent({ userId: user.id, dto });
  }

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

  @Delete('agents/:id')
  async deleteAgent(
    @RequestUser() user: UserPrincipal,
    @Param('id') id: string,
  ): Promise<AiAgentDto> {
    return await this.aiService.deleteAgent({ userId: user.id, agentId: id });
  }
}
