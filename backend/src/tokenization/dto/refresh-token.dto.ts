import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ example: 'some-encoded-refresh-token', description: 'The user refresh token' })
  @IsString()
  @IsNotEmpty({ message: 'Refresh token must be provided' })
  refreshToken: string;
}