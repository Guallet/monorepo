import { ApiProperty } from '@nestjs/swagger';
import type { UserSession } from '@thallesp/nestjs-better-auth';

export class CurrentSessionUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ format: 'email' })
  email: string;

  @ApiProperty()
  emailVerified: boolean;

  @ApiProperty({ required: false, nullable: true, format: 'uri' })
  image?: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;

  @ApiProperty({
    required: false,
    nullable: true,
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
  })
  role?: string | string[] | null;
}

export class CurrentSessionMetadataDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ type: String, format: 'date-time' })
  expiresAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;

  @ApiProperty({ required: false, nullable: true })
  ipAddress?: string | null;

  @ApiProperty({ required: false, nullable: true })
  userAgent?: string | null;

  @ApiProperty({ required: false, nullable: true })
  activeOrganizationId?: string | null;
}

export class CurrentSessionDto {
  @ApiProperty({ type: () => CurrentSessionUserDto })
  user: CurrentSessionUserDto;

  @ApiProperty({ type: () => CurrentSessionMetadataDto })
  session: CurrentSessionMetadataDto;

  static fromSession(session: UserSession): CurrentSessionDto {
    return {
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        emailVerified: session.user.emailVerified,
        image: session.user.image,
        createdAt: session.user.createdAt,
        updatedAt: session.user.updatedAt,
        role: session.user.role,
      },
      session: {
        id: session.session.id,
        expiresAt: session.session.expiresAt,
        createdAt: session.session.createdAt,
        updatedAt: session.session.updatedAt,
        ipAddress: session.session.ipAddress,
        userAgent: session.session.userAgent,
        activeOrganizationId: session.session.activeOrganizationId,
      },
    };
  }
}

export class CurrentSessionResponseDto {
  @ApiProperty({ type: () => CurrentSessionDto, nullable: true })
  session: CurrentSessionDto | null;
}
