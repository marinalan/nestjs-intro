import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common';
import { CreateUserDto } from '../dtos/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user.entity';
import { HashingProvider } from 'src/auth/providers/hashing.provider';
import { MailService } from 'src/mail/providers/mail.service';

@Injectable()
export class CreateUserProvider {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @Inject(forwardRef(() => HashingProvider))
    private readonly hashingProvider: HashingProvider,
    private readonly mailService: MailService,
  ) {}

  public async createUser(createUserDto: CreateUserDto) {
    let existingUser = undefined;

    try {
      // check if user exists with the same email
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      existingUser = await this.usersRepository.findOne({
        where: { email: createUserDto.email },
      });
    } catch(error) {
      // Might save the details of the exception
      // Information which is sensitive
      throw new RequestTimeoutException(
        'Unable to process your request at the moment, please try later',
        {
          description: 'Error connecting to the database',
        },
      );
    }
    // handle exception
    if (existingUser) {
      throw new BadRequestException(
        'The user already exists, please check your email.',
      );
    }
    // create a new user
    let newUser = this.usersRepository.create({
      ...createUserDto,
      password: await this.hashingProvider.hashPassword(createUserDto.password),
    });

    try {
      newUser = await this.usersRepository.save(newUser);
    } catch (error) {
      throw new RequestTimeoutException(
        'Unable to process your request at the moment, please try later',
        {
          description: 'Error connecting to the database',
        },
      );
    }

    try {
      await this.mailService.sendUserWelcome(newUser);
    } catch(error) {
      throw new RequestTimeoutException(error);
    }

    return newUser;
  }

}
