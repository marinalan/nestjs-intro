import { CreatePostDto } from '../dtos/create-post.dto';
import { UsersService } from 'src/users/providers/users.service';
import { TagsService } from 'src/tags/providers/tags.service';
import { PaginationProvider } from 'src/common/pagination/providers/pagination.provider';
import { Repository } from 'typeorm';
import { Post } from '../post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';

@Injectable()
export class CreatePostProvider {
  constructor(
    private readonly usersService: UsersService,
    private readonly tagsService: TagsService,
    private readonly paginationProvider: PaginationProvider<Post>,
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}

  public async create(createPostDto: CreatePostDto, user: ActiveUserData) {
    let author = undefined;
    let tags = undefined;

    try {
      // Find author from database based on authorId
      author = await this.usersService.findOneById(user.sub);
      // find tags
      tags = await this.tagsService.findMultipleTags(createPostDto.tags);
    } catch (error) {
      throw new ConflictException(error);
    }

    if (createPostDto.tags.length !== tags.length) {
      throw new BadRequestException('Please check your tag Ids');
    }
    const post = this.postsRepository.create({
      ...createPostDto,
      author: author,
      tags: tags,
    });

    try {
      return await this.postsRepository.save(post);
    } catch (error) {
      throw new ConflictException(error, {
        description: 'Ensure post slug is unique and not duplicate',
      });
    }
  }
}
