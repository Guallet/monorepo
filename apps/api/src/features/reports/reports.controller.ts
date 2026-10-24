import {
  BadRequestException,
  Controller,
  Get,
  Logger,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { isUUID } from 'class-validator';
import { ReportsService } from './reports.service';
import { UserPrincipal } from 'src/auth/user-principal';
import { RequestUser } from 'src/auth/request-user.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { CashflowDataDto } from './cashflow/cashflowData.dto';

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
}

function parseIds(value?: string): string[] | undefined {
  const ids = value?.split(',').filter(Boolean);
  if (ids?.some((id) => !isUUID(id))) {
    throw new BadRequestException('Invalid report filter ID');
  }

  return ids?.length ? ids : undefined;
}

function parseDate(value: string | undefined): Date | undefined {
  if (!value) return undefined;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new BadRequestException('Invalid report date');
  }

  return date;
}
