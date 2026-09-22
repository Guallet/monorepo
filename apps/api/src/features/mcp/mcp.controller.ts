import {
  BadRequestException,
  Controller,
  InternalServerErrorException,
  Post,
  Body,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { RequestUser } from 'src/auth/request-user.decorator';
import { UserPrincipal } from 'src/auth/user-principal';
import { McpApprovalDto } from './mcp-approval.dto';

@ApiTags('MCP')
@Controller('mcp')
export class McpController {
  @ApiOperation({ summary: 'Approve or deny an MCP authorization request' })
  @ApiBody({ type: () => McpApprovalDto })
  @ApiOkResponse({
    schema: { type: 'object', properties: { redirectUrl: { type: 'string' } } },
  })
  @Post('oauth/approve')
  async approve(
    @RequestUser() user: UserPrincipal,
    @Body() dto: McpApprovalDto,
  ): Promise<{ redirectUrl: string }> {
    if (!user) throw new UnauthorizedException();
    const internalUrl = process.env.MCP_INTERNAL_URL ?? 'http://localhost:5100';
    const approvalSecret = process.env.MCP_APPROVAL_SECRET;
    if (!approvalSecret)
      throw new InternalServerErrorException(
        'MCP authorization is not configured',
      );

    const response = await fetch(`${internalUrl}/oauth/approve`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-guallet-mcp-approval-secret': approvalSecret,
      },
      body: JSON.stringify({
        requestId: dto.requestId,
        userId: user.id,
        approved: dto.approved,
      }),
    });
    if (!response.ok) {
      throw new BadRequestException(
        'MCP authorization request is invalid or expired',
      );
    }
    const result: unknown = await response.json();
    if (!isRedirectResponse(result))
      throw new InternalServerErrorException(
        'Invalid MCP authorization response',
      );
    return result;
  }
}

function isRedirectResponse(value: unknown): value is { redirectUrl: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'redirectUrl' in value &&
    typeof value.redirectUrl === 'string'
  );
}
