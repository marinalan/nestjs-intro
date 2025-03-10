import { forwardRef, Inject, Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import jwtConfig from 'src/auth/config/jwt.config';
import { GoogleTokenDto } from '../dtos/google-token.dto';
import { UsersService } from 'src/users/providers/users.service';
import { GenerateTokensProvider } from 'src/auth/providers/generate-tokens.provider';

@Injectable()
export class GoogleAuthenticationService implements OnModuleInit {
  private oauthClient: OAuth2Client;

  constructor(
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,

    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,

    private readonly generateTokensProvider: GenerateTokensProvider,
  ) {}

  onModuleInit() {
    const clientId = this.jwtConfiguration.googleClientId;
    const clientSecret = this.jwtConfiguration.googleClientSecret;
    this.oauthClient = new OAuth2Client(clientId, clientSecret);
  }

  public async authenticate(googleToenDto: GoogleTokenDto) {
    try {
      // verify the Google token sent by user
      const loginTicket = await this.oauthClient.verifyIdToken({
        idToken: googleToenDto.token,
      });
      console.log(loginTicket);
      // extract he payload from Google JWT
      const {
        email,
        sub: googleId,
        given_name: firstName,
        family_name: lastName,
      } = loginTicket.getPayload();
      // find the user in the database using the GoogleId
      const user = await this.usersService.findOneByGoogleId(googleId);
      // if googleId exists generate token
      if (user) {
        return this.generateTokensProvider.generateTokens(user);
      }
      // if not create a new user and then generate tokens
      const newUser = await this.usersService.createGoogleUser({
        email: email,
        firstName: firstName,
        lastName: lastName,
        googleId: googleId,
      });
      return this.generateTokensProvider.generateTokens(newUser);
    } catch (error) {
      // throw unauthorised exception
      throw new UnauthorizedException(error);
    }
  }
}
