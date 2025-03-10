import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { TokenService } from './token.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Tokens')
@Controller('tokens')
export class TokenController {
  private readonly logger = new Logger(TokenController.name);

  constructor(private readonly tokenService: TokenService) {}

  @Post('validate')
  @ApiOperation({ summary: 'Validate the current access token' })
  @ApiResponse({ status: 200, description: 'Token is valid.' })
  @UseGuards(JwtAuthGuard)
  async validateToken(@Req() req: Request) {
    const sessionId = (req as any).sessionId || 'unknown';
    this.logger.log(`Session ${sessionId}: Validating access token`);
    // JwtAuthGuard ensures that the token is valid.
    return { message: 'Access token is valid' };
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh the access token using a valid refresh token',
  })
  @ApiResponse({ status: 200, description: 'New access token issued.' })
  async refreshToken(@Req() req: Request) {
    const sessionId = (req as any).sessionId || 'unknown';
    this.logger.log(`Session ${sessionId}: Received refresh token request`);

    // Fetch the refresh token from the cookies (ensure cookie-parser is set up)
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      this.logger.warn(
        `Session ${sessionId}: No refresh token found in cookies`,
      );
      throw new UnauthorizedException('Refresh token not found');
    }

    const result = await this.tokenService.refreshToken({ refreshToken });
    this.logger.log(`Session ${sessionId}: New access token issued`);
    return result;
  }
}
