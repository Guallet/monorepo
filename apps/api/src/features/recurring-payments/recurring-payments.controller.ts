import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
  ParseUUIDPipe,
  HttpCode,
} from '@nestjs/common';
import { RecurringPaymentsService } from './recurring-payments.service';
import { CreateRecurringPaymentDto } from './dto/create-recurring-payment.dto';
import { UpdateRecurringPaymentDto } from './dto/update-recurring-payment.dto';
import { RecurringPaymentDto } from './dto/recurring-payment.dto';
import { DetectedRecurringPaymentDto } from './dto/detected-recurring-payment.dto';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequestUser } from 'src/auth/request-user.decorator';
import { UserPrincipal } from 'src/auth/user-principal';

@ApiTags('Recurring Payments')
@Controller('recurring-payments')
export class RecurringPaymentsController {
  private readonly logger = new Logger(RecurringPaymentsController.name);

  constructor(
    private readonly recurringPaymentsService: RecurringPaymentsService,
  ) {}

  @ApiBody({ type: CreateRecurringPaymentDto })
  @ApiCreatedResponse({
    description: 'The recurring payment has been successfully created.',
    type: RecurringPaymentDto,
  })
  @HttpCode(201)
  @Post()
  async create(
    @RequestUser() user: UserPrincipal,
    @Body() createDto: CreateRecurringPaymentDto,
  ): Promise<RecurringPaymentDto> {
    const entity = await this.recurringPaymentsService.create({
      userId: user.id,
      dto: createDto,
    });
    return RecurringPaymentDto.fromDomain(entity);
  }

  @ApiResponse({
    description: 'A list of recurring payments for the user',
    type: [RecurringPaymentDto],
  })
  @Get()
  async findAll(
    @RequestUser() user: UserPrincipal,
  ): Promise<RecurringPaymentDto[]> {
    const entities = await this.recurringPaymentsService.findAll(user.id);
    return entities.map((x) => RecurringPaymentDto.fromDomain(x));
  }

  @ApiResponse({
    description: 'Detect recurring payment patterns from transaction history',
    type: [DetectedRecurringPaymentDto],
  })
  @Get('detect')
  async detectRecurringPayments(
    @RequestUser() user: UserPrincipal,
  ): Promise<DetectedRecurringPaymentDto[]> {
    return await this.recurringPaymentsService.detectRecurringPayments(user.id);
  }

  @ApiResponse({
    description: 'Get suggested transactions for creating recurring payments',
    type: [DetectedRecurringPaymentDto],
  })
  @Get('suggested')
  async getSuggestedTransactions(
    @RequestUser() user: UserPrincipal,
  ): Promise<DetectedRecurringPaymentDto[]> {
    return await this.recurringPaymentsService.getSuggestedTransactions(
      user.id,
    );
  }

  @ApiParam({
    name: 'id',
    description: 'The ID of the recurring payment to retrieve',
  })
  @ApiResponse({
    description: 'The requested recurring payment',
    type: RecurringPaymentDto,
  })
  @Get(':id')
  async findOne(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<RecurringPaymentDto> {
    const entity = await this.recurringPaymentsService.findOne({
      id,
      userId: user.id,
    });
    return RecurringPaymentDto.fromDomain(entity);
  }

  @ApiParam({
    name: 'id',
    description: 'The ID of the recurring payment to update',
  })
  @ApiResponse({
    description: 'The updated recurring payment',
    type: RecurringPaymentDto,
  })
  @ApiBody({ type: UpdateRecurringPaymentDto })
  @Patch(':id')
  async update(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateRecurringPaymentDto,
  ): Promise<RecurringPaymentDto> {
    const entity = await this.recurringPaymentsService.update({
      id,
      userId: user.id,
      dto: updateDto,
    });
    return RecurringPaymentDto.fromDomain(entity);
  }

  @ApiParam({
    name: 'id',
    description: 'The ID of the recurring payment to delete',
  })
  @ApiResponse({
    description: 'The deleted recurring payment',
    type: RecurringPaymentDto,
  })
  @Delete(':id')
  async remove(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<RecurringPaymentDto> {
    const entity = await this.recurringPaymentsService.remove({
      id,
      userId: user.id,
    });
    return RecurringPaymentDto.fromDomain(entity);
  }
}
