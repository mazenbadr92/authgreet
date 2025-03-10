import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { CONFIG_KEYS } from '../common/config/constants';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async refreshToken(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<{ accessToken: string }> {
    const { refreshToken } = refreshTokenDto;
    this.logger.log(`Received refresh token request`);

    try {
      // Verify the refresh token.
      const decoded = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>(CONFIG_KEYS.REFRESH_JWT_SECRET),
      });
      this.logger.log(
        `Refresh token verified successfully for user sub: ${decoded.sub}`,
      );

      // Create a new access token using the decoded payload.
      const payload = { email: decoded.email, sub: decoded.sub };
      const accessToken = this.jwtService.sign(payload, {
        secret: this.configService.get<string>(CONFIG_KEYS.ACCESS_JWT_SECRET),
        expiresIn: this.configService.get<string>(
          CONFIG_KEYS.ACCESS_JWT_EXPIRES_IN,
        ),
      });
      this.logger.log(`New access token issued for user sub: ${decoded.sub}`);

      return { accessToken };
    } catch (error) {
      this.logger.error(
        `Refresh token verification failed: ${error.message}`,
        error.stack,
      );
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
