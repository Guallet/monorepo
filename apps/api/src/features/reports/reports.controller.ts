import { Controller, Get, Logger, Query, ParseIntPipe } from '@nestjs/common';
import { ReportsService } from './reports.service.js';
import { UserPrincipal } from '../../auth/user-principal.js';
import { RequestUser } from '../../auth/request-user.decorator.js';
import { ReportQueryFilter } from './dto/report-query-filter.js';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CashflowDataDto } from './cashflow/cashflowData.dto.js';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  private readonly logger = new Logger(ReportsController.name);

  constructor(private readonly reportsService: ReportsService) {}

  @Get('cashflow')
  @ApiOperation({ summary: 'Get the cash-flow report' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiQuery({ name: 'accounts', required: false, type: [String] })
  @ApiQuery({ name: 'categories', required: false, type: [String] })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    format: 'date-time',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    format: 'date-time',
  })
  @ApiResponse({ status: 200, type: CashflowDataDto })
  async getCashflowReport(
    @RequestUser() user: UserPrincipal,
    @Query() query: ReportQueryFilter,
    @Query('year', new ParseIntPipe({ optional: true })) year: number,
  ): Promise<CashflowDataDto> {
    return this.reportsService.getCashFlowReport({
      user_id: user.id,
      year: year ?? new Date().getFullYear(),
    });
  }
}
