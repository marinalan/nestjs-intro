import { BadRequestException, forwardRef, HttpException, HttpStatus, Inject, Injectable, RequestTimeoutException } from '@nestjs/common';
import { GetUsersParamDto } from '../dtos/get-users-param.dto';
import { DataSource, Repository } from 'typeorm';
import { User } from '../user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from '../dtos/create-user.dto';
import { AuthService } from 'src/auth/providers/auth.service';
import { UsersCreateManyProvider } from './users-create-many.provider';
import { CreateManyUsersDto } from '../dtos/create-many-users.dto';
import { CreateUserProvider } from './create-user.provider';
import { FindOneUserByEmailProvider } from './find-one-user-by-email.provider';
import { FindOneByGoogleIdProvider } from './find-one-by-google-id.provider';
import { CreateGoogleUserProvider } from './create-google-user.provider';
import { GoogleUser } from '../interfaces/google-user.interface';

/**
 * Class to connect to Users table and perform business operation
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    private readonly usersCreateManyProvider: UsersCreateManyProvider,

    private readonly createUserProvider: CreateUserProvider,

    private readonly findOneUserByEmailProvider: FindOneUserByEmailProvider,

    private readonly findOneByGoogleIdProvider: FindOneByGoogleIdProvider,

    private readonly createGoogleUserProvider: CreateGoogleUserProvider,
  ) {}

  public async createUser(createUserDto: CreateUserDto) {
    return this.createUserProvider.createUser(createUserDto);
  }

  /**
   * The method to get all the users from the database
   * @param getUserParamDto
   * @param limit
   * @param page
   * @returns
   */
  public findAll(
    getUserParamDto: GetUsersParamDto,
    limit: number,
    page: number,
  ) {
    // console.log(this.profileConfiguration);
    // console.log(this.profileConfiguration.apiKey);
    throw new HttpException(
      {
        status: HttpStatus.MOVED_PERMANENTLY,
        error: 'This API endpoint does not exist',
        fileName: 'users.service.ts',
        lineNumber: 88,
      },
      HttpStatus.MOVED_PERMANENTLY,
      {
        cause: new Error(),
        description: 'Occurs because API endpoint permanently moved',
      },
    );
  }

  /*
   * Find a user by ID
   */
  public async findOneById(id: number) {
    let user = undefined;

    try {
      user = await this.usersRepository.findOneBy({
        id: id,
      });
    } catch (error) {
      throw new RequestTimeoutException(
        'Unable to process your request at the moment, please try later',
        {
          description: 'Error connecting to the database',
        },
      );
    }
    // handle the user does not exist exception
    if (!user) {
      throw new BadRequestException(`The user with id=${id} does not exist`);
    }
    return user;
  }

  public async createMany(creatManyUsersDto: CreateManyUsersDto) {
    return this.usersCreateManyProvider.createMany(creatManyUsersDto);
  }

  public async findOneByEmail(email: string) {
    return await this.findOneUserByEmailProvider.findOneByEmail(email);
  }

  public async findOneByGoogleId(googleId: string){
    return await this.findOneByGoogleIdProvider.findOneByGoogleId(googleId);
  }

  public async createGoogleUser(googleUser: GoogleUser) {
    return await this.createGoogleUserProvider.createGoogleUser(googleUser);
  }
}
