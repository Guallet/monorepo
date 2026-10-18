/* oxlint-disable no-control-regex -- Deliberately reject or strip control characters from outbound data. */
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsIn,
  Length,
  MaxLength,
  Matches,
  IsNumber,
  Min,
  Max,
  IsBoolean,
  IsOptional,
  IsArray,
  ArrayMaxSize,
  ArrayMinSize,
  IsUUID,
} from 'class-validator';

export class CreateDecisionConnectionDto {
  @ApiProperty({ required: true })
  @IsString()
  @Length(1, 80)
  displayName: string;
  @ApiProperty({ required: true })
  @IsString()
  @Length(1, 2048)
  baseUrl: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  model?: string;
  @ApiProperty({ enum: ['none', 'bearer', 'header', 'basic'], required: false })
  @IsOptional()
  @IsIn(['none', 'bearer', 'header', 'basic'])
  authType?: 'none' | 'bearer' | 'header' | 'basic';
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z0-9-]{1,64}$/)
  authHeaderName?: string;
  @ApiProperty({ writeOnly: true, required: false })
  @IsOptional()
  @IsString()
  @MaxLength(4096)
  @Matches(/^[^\u0000-\u001f\u007f]*$/)
  apiKey?: string;
  @ApiProperty({ writeOnly: true, required: false })
  @IsOptional()
  @IsString()
  @MaxLength(4096)
  @Matches(/^[^\u0000-\u001f\u007f]*$/)
  headerValue?: string;
  @ApiProperty({ writeOnly: true, required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1024)
  @Matches(/^[^:\u0000-\u001f\u007f]*$/)
  clientId?: string;
  @ApiProperty({ writeOnly: true, required: false })
  @IsOptional()
  @IsString()
  @MaxLength(4096)
  @Matches(/^[^\u0000-\u001f\u007f]*$/)
  clientSecret?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  minConfidence?: number;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  minMargin?: number;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  sendNotes?: boolean;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateDecisionConnectionDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(1, 80)
  displayName?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(1, 2048)
  baseUrl?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  model?: string;
  @ApiProperty({ enum: ['none', 'bearer', 'header', 'basic'], required: false })
  @IsOptional()
  @IsIn(['none', 'bearer', 'header', 'basic'])
  authType?: 'none' | 'bearer' | 'header' | 'basic';
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z0-9-]{1,64}$/)
  authHeaderName?: string;
  @ApiProperty({ writeOnly: true, required: false })
  @IsOptional()
  @IsString()
  @MaxLength(4096)
  @Matches(/^[^\u0000-\u001f\u007f]*$/)
  apiKey?: string;
  @ApiProperty({ writeOnly: true, required: false })
  @IsOptional()
  @IsString()
  @MaxLength(4096)
  @Matches(/^[^\u0000-\u001f\u007f]*$/)
  headerValue?: string;
  @ApiProperty({ writeOnly: true, required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1024)
  @Matches(/^[^:\u0000-\u001f\u007f]*$/)
  clientId?: string;
  @ApiProperty({ writeOnly: true, required: false })
  @IsOptional()
  @IsString()
  @MaxLength(4096)
  @Matches(/^[^\u0000-\u001f\u007f]*$/)
  clientSecret?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  minConfidence?: number;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  minMargin?: number;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  sendNotes?: boolean;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ClassificationRunRequestDto {
  @ApiProperty({ required: false, enum: ['inbox'] })
  @IsOptional()
  @IsIn(['inbox'])
  scope?: 'inbox';
  @ApiProperty({
    required: false,
    type: 'array',
    items: { type: 'string', format: 'uuid' },
    maxItems: 500,
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @IsUUID('all', { each: true })
  transactionIds?: string[];
}
export class ClassificationRunDto {
  @ApiProperty({ format: 'uuid' }) runId: string;
  @ApiProperty() queued: number;
  @ApiProperty() processed: number;
  @ApiProperty() suggested: number;
  @ApiProperty() abstained: number;
  @ApiProperty() skipped: number;
  @ApiProperty() failed: number;
  @ApiProperty() complete: boolean;
}
export class DecisionTestDto {
  @ApiProperty() ok: boolean;
  @ApiProperty({
    enum: ['ok', 'blocked', 'auth', 'rate_limit', 'unavailable', 'protocol'],
  })
  status: string;
}
export class DecisionConnectionDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty() displayName: string;
  @ApiProperty() baseUrl: string;
  @ApiProperty() model: string;
  @ApiProperty({ enum: ['none', 'bearer', 'header', 'basic'] })
  authType: string;
  @ApiProperty({ type: String, nullable: true }) authHeaderName: string | null;
  @ApiProperty() hasCredentials: boolean;
  @ApiProperty({ type: String, nullable: true }) credentialHint: string | null;
  @ApiProperty() minConfidence: number;
  @ApiProperty() minMargin: number;
  @ApiProperty() sendNotes: boolean;
  @ApiProperty() isActive: boolean;
  @ApiProperty({ type: String, nullable: true }) lastTestStatus: string | null;
  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  lastTestAt: Date | null;
}
export class SuggestionDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty({ enum: ['rule', 'decision_api'] }) source:
    | 'rule'
    | 'decision_api';
  @ApiProperty({ format: 'uuid' }) categoryId: string;
  @ApiProperty({
    type: Number,
    nullable: true,
    description: 'Provider score, not calibrated accuracy',
  })
  confidence: number | null;
  @ApiProperty({ type: String, nullable: true, format: 'uuid' }) ruleId:
    | string
    | null;
}
export class ClassificationStatsDto {
  @ApiProperty() accepted: number;
  @ApiProperty() rejected: number;
  @ApiProperty() dismissed: number;
  @ApiProperty({
    type: Number,
    nullable: true,
    description: 'accepted / (accepted + rejected); null without reviews',
  })
  acceptanceRate: number | null;
}
