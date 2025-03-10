import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Res,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthenticateService } from './authenticate.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { APP_CONSTANTS, COOKIES_CONSTANTS } from 'src/common/config/constants';

@ApiTags('Authentication')
@Controller('authenticate')
export class AuthenticateController {
  private readonly logger = new Logger(AuthenticateController.name);

  constructor(private readonly authService: AuthenticateService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully signed up' })
  async signup(@Body() signupDto: SignupDto, @Req() req: Request) {
    const sessionId = (req as any).sessionId || APP_CONSTANTS.UNKNOWN_SESSION;
    this.logger.log(
      `Session ${sessionId}: Received signup request for email: ${signupDto.email}`,
    );
    const result = await this.authService.signup(signupDto);
    this.logger.log(
      `Session ${sessionId}: User signed up successfully with email: ${signupDto.email}`,
    );
    return result;
  }

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'User successfully logged in' })
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const sessionId = (req as any).sessionId || APP_CONSTANTS.UNKNOWN_SESSION;
    this.logger.log(
      `Session ${sessionId}: Received login request for email: ${loginDto.email}`,
    );

    const tokens = await this.authService.login(loginDto, req);

    // Log token issuance event.
    this.logger.log(
      `Session ${sessionId}: Issued access token for email: ${loginDto.email}`,
    );

    // Set the refresh token as an HttpOnly cookie.
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === APP_CONSTANTS.PRODUCTION,
      sameSite: process.env.NODE_ENV === APP_CONSTANTS.PRODUCTION ? 'strict' : 'lax',
      maxAge: COOKIES_CONSTANTS.ONE_MONTH, // 30 days in seconds.
    });

    this.logger.log(
      `Session ${sessionId}: Set refresh token cookie for email: ${loginDto.email}`,
    );

    // Return the access token in the response body.
    const responsePayload = {
      message: 'User successfully logged in',
      accessToken: tokens.accessToken,
    };
    this.logger.log(
      `Session ${sessionId}: Login response sent for email: ${loginDto.email}`,
    );
    return responsePayload;
  }

  @Post('logout')
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'User successfully logged out' })
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return await this.authService.logout(req, res);
  }
}
