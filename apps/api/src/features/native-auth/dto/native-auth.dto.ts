import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, Matches } from 'class-validator';

export class StartNativeFlowDto {
  @ApiProperty({
    description: 'Base64url SHA-256 of a verifier retained by the native app',
    minLength: 43,
    maxLength: 43,
  })
  @IsString()
  @Matches(/^[A-Za-z0-9_-]{43}$/)
  challenge: string;
}
export class StartNativeResetDto extends StartNativeFlowDto {
  @ApiProperty({ format: 'email', maxLength: 254 })
  @IsEmail()
  @Length(3, 254)
  email: string;
}
export class RedeemNativeFlowDto {
  @ApiProperty({ minLength: 43, maxLength: 43 })
  @IsString()
  @Matches(/^[A-Za-z0-9_-]{43}$/)
  flowId: string;
  @ApiProperty({
    description: 'Completion code delivered only through the browser callback',
    minLength: 43,
    maxLength: 43,
  })
  @IsString()
  @Matches(/^[A-Za-z0-9_-]{43}$/)
  code: string;
  @ApiProperty({
    description:
      'Original private verifier; sent only in the HTTPS request body',
    minLength: 43,
    maxLength: 128,
  })
  @IsString()
  @Matches(/^[A-Za-z0-9._~-]{43,128}$/)
  verifier: string;
}
export class CompleteNativeResetDto extends RedeemNativeFlowDto {
  @ApiProperty({
    minLength: 8,
    maxLength: 128,
    writeOnly: true,
    format: 'password',
  })
  @IsString()
  @Length(8, 128)
  newPassword: string;
}
export class NativeFlowDto {
  @ApiProperty() flowId: string;
  @ApiProperty({ description: 'Lifetime in seconds', example: 600 })
  expiresIn: number;
}
export class NativeGoogleFlowDto extends NativeFlowDto {
  @ApiProperty({
    format: 'uri',
    description: 'HTTPS browser entry on the API origin',
  })
  browserUrl: string;
}
export class NativeAuthResultDto {
  @ApiProperty({
    description: 'Credentials are delivered only in a secure Set-Cookie header',
  })
  success: boolean;
}

export class NativeFlowQueryDto {
  @ApiProperty({ minLength: 43, maxLength: 43 })
  @IsString()
  @Matches(/^[A-Za-z0-9_-]{43}$/)
  flowId: string;
}
export class NativeCallbackQueryDto extends NativeFlowQueryDto {
  @ApiProperty({ minLength: 43, maxLength: 43 })
  @IsString()
  @Matches(/^[A-Za-z0-9_-]{43}$/)
  code: string;
}
