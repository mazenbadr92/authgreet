import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './models/user.model';
import { Request, Response } from 'express';
import { APP_CONSTANTS, CONFIG_KEYS } from '../common/config/constants';

@Injectable()
export class AuthenticateService {
  private readonly logger = new Logger(AuthenticateService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signup(signupDto: SignupDto): Promise<any> {
    const { email, name, password } = signupDto;
    this.logger.log(`Signup initiated for email: ${email}`);

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      this.logger.warn(`Signup attempt failed: Email ${email} already exists`);
      throw new ConflictException('User with this email already exists');
    }

    const pepper =
      this.configService.get<string>(CONFIG_KEYS.BCRYPT_PEPPER) || '';
    const saltRounds = parseInt(
      this.configService.get<string>(CONFIG_KEYS.BCRYPT_SALT_ROUNDS) || '10',
      10,
    );
    const hashedPassword = await bcrypt.hash(password + pepper, saltRounds);

    const newUser = new this.userModel({
      email,
      name,
      password: hashedPassword,
    });

    await newUser.save();
    this.logger.log(`Signup successful for email: ${email}`);

    return { message: 'User registered successfully' };
  }

  async login(loginDto: LoginDto, req: Request): Promise<any> {
    const { email, password } = loginDto;
    // Extract sessionId if available, defaulting to 'unknown'
    const sessionId = (req as any).sessionId || 'unknown';
    this.logger.log(`Session ${sessionId}: Login attempt for email: ${email}`);

    const user = await this.userModel.findOne({ email });
    if (!user) {
      this.logger.warn(
        `Session ${sessionId}: Login failed for email: ${email} - User not found`,
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    const pepper =
      this.configService.get<string>(CONFIG_KEYS.BCRYPT_PEPPER) || '';
    const isPasswordValid = await bcrypt.compare(
      password + pepper,
      user.password,
    );
    if (!isPasswordValid) {
      this.logger.warn(
        `Session ${sessionId}: Login failed for email: ${email} - Invalid password`,
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user._id };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>(CONFIG_KEYS.ACCESS_JWT_SECRET),
      expiresIn: this.configService.get<string>(
        CONFIG_KEYS.ACCESS_JWT_EXPIRES_IN,
      ),
    });

    // Log issuance of access token.
    this.logger.log(
      `Session ${sessionId}: Issued access token for email: ${email}`,
    );

    const iat = Math.floor(Date.now() / 1000);
    const refreshTokenPayload = { sub: user._id, iat };
    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      noTimestamp: true,
      secret: this.configService.get<string>(CONFIG_KEYS.REFRESH_JWT_SECRET),
    });

    this.logger.log(
      `Session ${sessionId}: Issued refresh token for email: ${email}`,
    );

    return { message: 'Login successful', accessToken, refreshToken };
  }

  async logout(req: Request, res: Response): Promise<any> {
    const sessionId = (req as any).sessionId || 'unknown';
    this.logger.log(`Session ${sessionId}: Logout initiated`);

    // Clear the refresh token cookie
    res.clearCookie(APP_CONSTANTS.REFRESH_TOKEN_KEY, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === APP_CONSTANTS.PRODUCTION,
      sameSite:
        process.env.NODE_ENV === APP_CONSTANTS.PRODUCTION ? 'strict' : 'lax',
      path: '/',
    });

    this.logger.log(`Session ${sessionId}: Logout completed`);
    return { message: 'Logout successful' };
  }
}
