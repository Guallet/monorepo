import { Controller, Get, Logger, Query, ParseIntPipe } from '@nestjs/common';
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
import { MonthlyReportQueryDto } from './dto/monthly-report-query.dto';
import { MonthlyReportDto } from './dto/monthly-report.dto';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  private readonly logger = new Logger(ReportsController.name);

  constructor(private readonly reportsService: ReportsService) {}

  @ApiOperation({
    summary:
      'Monthly income, spending and category totals, separated by currency',
    description:
      'Uses UTC calendar months. Positive amounts are inflows; negative amounts are outflows. Includes transfers and refunds; no conversion or transfer matching is performed.',
  })
  @ApiOkResponse({ type: MonthlyReportDto })
  @ApiQuery({ name: 'year', type: Number, required: true })
  @ApiQuery({ name: 'month', type: Number, required: true })
  @ApiQuery({
    name: 'accounts',
    type: String,
    required: false,
    description: 'Comma-separated account UUIDs',
  })
  @ApiQuery({
    name: 'categories',
    type: String,
    required: false,
    description: 'Comma-separated category UUIDs; includes descendants',
  })
  @Get('monthly')
  async getMonthlyReport(
    @RequestUser() user: UserPrincipal,
    @Query() query: MonthlyReportQueryDto,
  ): Promise<MonthlyReportDto> {
    return this.reportsService.getMonthlyReport(user.id, query);
  }

  @ApiOperation({ summary: 'getCashflowReport' })
  @ApiOkResponse({ type: () => CashflowDataDto })
  @ApiQuery({ name: 'year', type: Number, required: false })
  @Get('cashflow')
  async getCashflowReport(
    @RequestUser() user: UserPrincipal,
    @Query('year', new ParseIntPipe({ optional: true })) year?: number,
  ): Promise<CashflowDataDto> {
    return this.reportsService.getCashFlowReport({
      user_id: user.id,
      year: year ?? new Date().getFullYear(),
    });
  }
}
