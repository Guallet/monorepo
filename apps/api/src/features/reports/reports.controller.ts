import {
  BadRequestException,
  Controller,
  Get,
  Logger,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { isISO8601, isUUID } from 'class-validator';
import { ReportsService } from './reports.service';
import { UserPrincipal } from 'src/auth/user-principal';
import { RequestUser } from 'src/auth/request-user.decorator';
import {
  ApiTags,
  ApiBadRequestResponse,
  ApiOperation,
  ApiOkResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { CashflowDataDto } from './cashflow/cashflowData.dto';
import { MoneyFlowReportDto } from './dto/money-flow.dto';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  private readonly logger = new Logger(ReportsController.name);

  constructor(private readonly reportsService: ReportsService) {}

  @ApiOperation({ summary: 'getCashflowReport' })
  @ApiOkResponse({ type: () => CashflowDataDto })
  @ApiQuery({ name: 'year', type: Number, required: false })
  @ApiQuery({ name: 'accounts', type: String, required: false })
  @ApiQuery({ name: 'categories', type: String, required: false })
  @ApiQuery({ name: 'startDate', type: String, required: false })
  @ApiQuery({ name: 'endDate', type: String, required: false })
  @Get('cashflow')
  async getCashflowReport(
    @RequestUser() user: UserPrincipal,
    @Query('year', new ParseIntPipe({ optional: true })) year?: number,
    @Query('accounts') accounts?: string,
    @Query('categories') categories?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<CashflowDataDto> {
    const parsedStartDate = parseDate(startDate);
    const parsedEndDate = parseDate(endDate);
    const parsedAccounts = parseIds(accounts);
    const parsedCategories = parseIds(categories);

    return this.reportsService.getCashFlowReport({
      user_id: user.id,
      year: year ?? new Date().getFullYear(),
      ...(parsedAccounts ? { accounts: parsedAccounts } : {}),
      ...(parsedCategories ? { categories: parsedCategories } : {}),
      ...(parsedStartDate ? { startDate: parsedStartDate } : {}),
      ...(parsedEndDate ? { endDate: parsedEndDate } : {}),
    });
  }

  @ApiOperation({ summary: 'Get gross money in and out by category' })
  @ApiOkResponse({ type: () => MoneyFlowReportDto })
  @ApiBadRequestResponse({ description: 'Invalid date range or account IDs' })
  @ApiQuery({
    name: 'startDate',
    schema: { type: 'string', format: 'date', example: '2026-11-01' },
    description: 'First calendar date to include',
  })
  @ApiQuery({
    name: 'endDate',
    schema: { type: 'string', format: 'date', example: '2026-11-30' },
    description: 'Last calendar date to include',
  })
  @ApiQuery({
    name: 'accounts',
    type: String,
    required: false,
    description: 'Comma-separated account IDs',
  })
  @Get('money-flow')
  async getMoneyFlowReport(
    @RequestUser() user: UserPrincipal,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('accounts') accounts?: string,
  ): Promise<MoneyFlowReportDto> {
    const start = parseMoneyFlowDate(startDate);
    const end = parseMoneyFlowDate(endDate);
    if (start > end) {
      throw new BadRequestException(
        'Report start date must be on or before the end date',
      );
    }

    return this.reportsService.getMoneyFlowReport({
      user_id: user.id,
      startDate: start,
      endDate: end,
      accounts: parseIds(accounts),
    });
  }
}

function parseIds(value?: string): string[] | undefined {
  if (value !== undefined && typeof value !== 'string') {
    throw new BadRequestException('Invalid report filter ID');
  }
  const ids = value?.split(',').filter(Boolean);
  if (ids?.some((id) => !isUUID(id))) {
    throw new BadRequestException('Invalid report filter ID');
  }

  return ids?.length ? ids : undefined;
}

function parseMoneyFlowDate(value?: string): string {
  if (
    typeof value !== 'string' ||
    !/^(?!0000)\d{4}-\d{2}-\d{2}$/.test(value) ||
    !isISO8601(value, { strict: true })
  ) {
    throw new BadRequestException('Report dates must use YYYY-MM-DD');
  }

  return value;
}

function parseDate(value: string | undefined): Date | undefined {
  if (!value) return undefined;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new BadRequestException('Invalid report date');
  }

  return date;
}
