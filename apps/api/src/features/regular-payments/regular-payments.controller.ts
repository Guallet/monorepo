import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
} from '@nestjs/common';
import { RegularPaymentsService } from './regular-payments.service';
import { CreateRegularPaymentDto } from './dto/create-regular-payment.dto';
import { UpdateRegularPaymentDto } from './dto/update-regular-payment.dto';
import { ApiTags } from '@nestjs/swagger';
import { RegularPaymentDto } from './dto/regular-payment.dto';
import { UserPrincipal } from 'src/auth/user-principal';
import { RequestUser } from 'src/auth/request-user.decorator';

@ApiTags('Regular Payments')
@Controller('regular-payments')
export class RegularPaymentsController {
  private readonly logger = new Logger(RegularPaymentsController.name);

  constructor(
    private readonly regularPaymentsService: RegularPaymentsService,
  ) {}

  @Get()
  async findAll(
    @RequestUser() user: UserPrincipal,
  ): Promise<RegularPaymentDto[]> {
    const entities = await this.regularPaymentsService.findUserRegularPayments(
      user.id,
    );
    return entities.map((x) => RegularPaymentDto.fromDomain(x));
  }

  @Get(':id')
  async findOne(
    @RequestUser() user: UserPrincipal,
    @Param('id') id: string,
  ): Promise<RegularPaymentDto> {
    const entity = await this.regularPaymentsService.findUserRegularPayment({
      userId: user.id,
      id,
    });
    return RegularPaymentDto.fromDomain(entity);
  }

  @Post()
  async create(
    @RequestUser() user: UserPrincipal,
    @Body() createRegularPaymentDto: CreateRegularPaymentDto,
  ): Promise<RegularPaymentDto> {
    this.logger.debug(`Creating new regular payment for user ${user.id}`);
    const entity = await this.regularPaymentsService.create({
      userId: user.id,
      createRegularPaymentDto,
    });
    return RegularPaymentDto.fromDomain(entity);
  }

  @Patch(':id')
  async update(
    @RequestUser() user: UserPrincipal,
    @Param('id') id: string,
    @Body() updateRegularPaymentDto: UpdateRegularPaymentDto,
  ): Promise<RegularPaymentDto> {
    const updated = await this.regularPaymentsService.update({
      userId: user.id,
      id: id,
      dto: updateRegularPaymentDto,
    });
    return RegularPaymentDto.fromDomain(updated);
  }

  @Delete(':id')
  async remove(
    @RequestUser() user: UserPrincipal,
    @Param('id') id: string,
  ): Promise<RegularPaymentDto> {
    const deleted = await this.regularPaymentsService.remove({
      userId: user.id,
      id,
    });
    return RegularPaymentDto.fromDomain(deleted);
  }
}
