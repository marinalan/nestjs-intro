import {
  forwardRef,
  Inject,
  Injectable,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignInDto } from '../dtos/signin.dto';
import { UsersService } from 'src/users/providers/users.service';
import { HashingProvider } from './hashing.provider';
import { GenerateTokensProvider } from './generate-tokens.provider';

@Injectable()
export class SignInProvider {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly hashingProvider: HashingProvider,
    private readonly generateTokensProvider: GenerateTokensProvider,
  ) {}
  public async signIn(signInDto: SignInDto) {
    // Find the user using email ID
    // Throw an exception user not found
    const user = await this.usersService.findOneByEmail(signInDto.email);
    // Compare password to the hash
    let isEqual: boolean = false;

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      isEqual = await this.hashingProvider.comparePassword(
        signInDto.password,
        user.password,
      );
    } catch (error) {
      throw new RequestTimeoutException(error, {
        description: 'Could not compare passwords',
      });
    }

    if (!isEqual) {
      throw new UnauthorizedException('Incorrect Password');
    }

    return await this.generateTokensProvider.generateTokens(user);
  }
}
