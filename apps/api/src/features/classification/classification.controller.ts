import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { RequestUser } from 'src/auth/request-user.decorator';
import { UserPrincipal } from 'src/auth/user-principal';
import { ClassificationService } from './classification.service';
import { DecisionConnectionsService } from './decision-connections.service';
import {
  CreateDecisionConnectionDto,
  UpdateDecisionConnectionDto,
  DecisionConnectionDto,
  DecisionTestDto,
  ClassificationRunRequestDto,
  ClassificationRunDto,
  ClassificationStatsDto,
} from './dto/classification.dto';

@ApiTags('Classification')
@UseGuards(ThrottlerGuard)
@Throttle({ default: { limit: 10, ttl: 60000 } })
@Controller('decision-connections')
export class DecisionConnectionsController {
  constructor(private readonly service: DecisionConnectionsService) {}
  @Get()
  @ApiOperation({ summary: 'Get the classification connection' })
  @ApiOkResponse({ type: DecisionConnectionDto, isArray: true })
  async get(@RequestUser() user: UserPrincipal) {
    const c = await this.service.get({ userId: user.id });
    return c ? [this.service.toDto(c)] : [];
  }
  @Post()
  @ApiOperation({ summary: 'Create and test a classification connection' })
  @ApiBody({ type: CreateDecisionConnectionDto })
  @ApiCreatedResponse({ type: DecisionConnectionDto })
  create(
    @RequestUser() user: UserPrincipal,
    @Body() dto: CreateDecisionConnectionDto,
  ) {
    return this.service.save({ userId: user.id, dto, create: true });
  }
  @Patch()
  @ApiOperation({ summary: 'Update and test the classification connection' })
  @ApiBody({ type: UpdateDecisionConnectionDto })
  @ApiOkResponse({ type: DecisionConnectionDto })
  update(
    @RequestUser() user: UserPrincipal,
    @Body() dto: UpdateDecisionConnectionDto,
  ) {
    return this.service.save({ userId: user.id, dto, create: false });
  }
  @Delete()
  @HttpCode(204)
  @ApiOperation({ summary: 'Hard delete the classification connection' })
  @ApiNoContentResponse()
  remove(@RequestUser() user: UserPrincipal) {
    return this.service.remove({ userId: user.id });
  }
  @Post('test')
  @HttpCode(200)
  @ApiOperation({ summary: 'Test an unsaved connection' })
  @ApiBody({ type: CreateDecisionConnectionDto })
  @ApiOkResponse({ type: DecisionTestDto })
  testDraft(
    @RequestUser() user: UserPrincipal,
    @Body() dto: CreateDecisionConnectionDto,
  ) {
    return this.service.test({ userId: user.id, dto });
  }
  @Post('test-saved')
  @HttpCode(200)
  @ApiOperation({ summary: 'Test the saved connection' })
  @ApiOkResponse({ type: DecisionTestDto })
  test(@RequestUser() user: UserPrincipal) {
    return this.service.test({ userId: user.id });
  }
}
@ApiTags('Classification')
@UseGuards(ThrottlerGuard)
@Controller('classification')
export class ClassificationController {
  constructor(private readonly service: ClassificationService) {}
  @Post('run')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({
    summary: 'Queue inbox or selected transactions for classification',
  })
  @ApiBody({ type: ClassificationRunRequestDto })
  @ApiCreatedResponse({ type: ClassificationRunDto })
  run(
    @RequestUser() user: UserPrincipal,
    @Body() dto: ClassificationRunRequestDto,
  ) {
    return this.service.run({ userId: user.id, dto });
  }
  @Get('runs/:id')
  @ApiOperation({ summary: 'Get aggregate classification run progress' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: ClassificationRunDto })
  status(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) runId: string,
  ) {
    return this.service.status({ userId: user.id, runId });
  }
  @Post('suggestions/:id/dismiss')
  @HttpCode(204)
  @ApiOperation({ summary: 'Dismiss a pending suggestion' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiNoContentResponse()
  dismiss(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.dismiss({ userId: user.id, id });
  }
  @Get('stats')
  @ApiOperation({
    summary: 'Get review counts for suggestions created in the last 30 days',
  })
  @ApiOkResponse({ type: ClassificationStatsDto })
  stats(@RequestUser() user: UserPrincipal) {
    return this.service.stats({ userId: user.id });
  }
}
