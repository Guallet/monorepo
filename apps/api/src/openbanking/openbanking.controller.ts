import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { OpenbankingService } from './openbanking.service';
import { CreateOpenbankingDto } from './dto/create-openbanking.dto';
import { UpdateOpenbankingDto } from './dto/update-openbanking.dto';

@Controller('openbanking')
export class OpenbankingController {
  constructor(private readonly openbankingService: OpenbankingService) {}

  @Post()
  create(@Body() createOpenbankingDto: CreateOpenbankingDto) {
    return this.openbankingService.create(createOpenbankingDto);
  }

  @Get()
  findAll() {
    return this.openbankingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.openbankingService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.openbankingService.remove(+id);
  }
}
