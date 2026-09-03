import { ApiProperty } from '@nestjs/swagger';

export class RuleOperatorDefinitionDto {
  @ApiProperty()
  value: string;

  @ApiProperty()
  label: string;
}

export class RuleFieldDefinitionDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  label: string;

  @ApiProperty({ enum: ['account', 'string', 'number', 'datetime'] })
  type: string;

  @ApiProperty({ type: () => [RuleOperatorDefinitionDto] })
  operators: RuleOperatorDefinitionDto[];
}

export class RuleFieldDefinitionsDto {
  @ApiProperty({ type: () => [RuleFieldDefinitionDto] })
  fields: RuleFieldDefinitionDto[];
}
