import { Injectable, Logger } from "@nestjs/common";
import { CreateInstitutionInput } from "./dto/create-institution.input";
import { UpdateInstitutionInput } from "./dto/update-institution.input";
import { Institution } from "./models/institution.model";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class InstitutionsService {
  private readonly logger = new Logger(InstitutionsService.name);

  constructor(
    @InjectRepository(Institution)
    private repository: Repository<Institution>
  ) {}



  findAll(): Promise<Institution[]> {
    return this.repository.find();
  }

  findOne(id: string): Promise<Institution> {
    return this.repository.findOne({
      where: {
        id: id,
      },
    });
  }

  create(createInstitutionInput: CreateInstitutionInput) {
    return "This action adds a new institution";
  }

  update(id: string, updateInstitutionInput: UpdateInstitutionInput) {
    return `This action updates a #${id} institution`;
  }

  remove(id: number) {
    return `This action removes a #${id} institution`;
  }
}
