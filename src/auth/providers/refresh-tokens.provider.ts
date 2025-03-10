import {
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { UsersService } from 'src/users/providers/users.service';
import { GenerateTokensProvider } from './generate-tokens.provider';
import { ActiveUserData } from '../interfaces/active-user-data.interface';

@Injectable()
export class RefreshTokensProvider {

  constructor(
    private readonly generateTokensProvider: GenerateTokensProvider,

    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,

    private readonly jwtService: JwtService,

    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  public async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    try {
      // verify the refresh token using jwtService
      const { sub } = await this.jwtService.verifyAsync<
        Pick<ActiveUserData, 'sub'>
      >(refreshTokenDto.refreshToken, {
        secret: this.jwtConfiguration.secret,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
      });
      // fetch the user from the database
      const user = await this.usersService.findOneById(sub);
      // generate the tokens
      return await this.generateTokensProvider.generateTokens(user);
    } catch(error) {
      throw new UnauthorizedException(error);
    }
  }
}
