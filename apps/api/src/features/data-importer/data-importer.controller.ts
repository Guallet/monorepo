import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DataImporterService } from './data-importer.service';
import { CsvImportRequestDto } from './dto/csv-import-request.dto';
import { CsvImportResponseDto } from './dto/csv-import-response.dto';
import { RequestUser } from 'src/auth/request-user.decorator';
import { UserPrincipal } from 'src/auth/user-principal';

@ApiTags('Data Importer')
@Controller('data-importer')
export class DataImporterController {
  private readonly logger = new Logger(DataImporterController.name);

  constructor(private readonly dataImporterService: DataImporterService) {}

  @Post('csv')
  async importCsv(
    @RequestUser() user: UserPrincipal,
    @Body() dto: CsvImportRequestDto,
  ): Promise<CsvImportResponseDto> {
    this.logger.log(`CSV import request from user ${user.id}`);
    return this.dataImporterService.importCsvData(user.id, dto);
  }
}
