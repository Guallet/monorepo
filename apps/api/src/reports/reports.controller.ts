import { Controller, Get, Logger, Query, ParseIntPipe } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { UserPrincipal } from 'src/core/auth/user-principal';
import { RequestUser } from 'src/core/auth/request-user.decorator';
import { ReportQueryFilter } from './dto/report-query-filter';

@Controller('reports')
export class ReportsController {
  private readonly logger = new Logger(ReportsController.name);

  constructor(private readonly reportsService: ReportsService) {}

  @Get('cashflow')
  getCashflowReport(
    @RequestUser() user: UserPrincipal,
    @Query() query: ReportQueryFilter,
    @Query('year', new ParseIntPipe({ optional: true })) year: number,
  ) {
    if (year === undefined || year === null) {
      year = new Date().getFullYear();
    }
    return this.reportsService.getCashFlowReport({
      user_id: user.id,
      year: year,
    });
  }
}
