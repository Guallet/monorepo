import { Controller, Get, Logger, Query, ParseIntPipe } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { UserPrincipal } from 'src/auth/user-principal';
import { RequestUser } from 'src/auth/request-user.decorator';
import { ReportQueryFilter } from './dto/report-query-filter';
import { ApiTags } from '@nestjs/swagger';
import { CashflowDataDto } from './cashflow/cashflowData.dto';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  private readonly logger = new Logger(ReportsController.name);

  constructor(private readonly reportsService: ReportsService) {}

  @Get('cashflow')
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
