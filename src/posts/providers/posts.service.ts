import { BadRequestException, Body, Injectable, RequestTimeoutException } from '@nestjs/common';
import { UsersService } from 'src/users/providers/users.service';
import { CreatePostDto } from '../dtos/create-post.dto';
import { Repository } from 'typeorm';
import { Post } from '../post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { TagsService } from 'src/tags/providers/tags.service';
import { PatchPostDto } from '../dtos/patch-post.dto';
import { GetPostsDto } from '../dtos/get-posts.dto';
import { PaginationProvider } from 'src/common/pagination/providers/pagination.provider';
import { Paginated } from '../../common/pagination/interfaces/paginated.interface';
import { CreatePostProvider } from './create-post.provider';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';

@Injectable()
export class PostsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tagsService: TagsService,
    private readonly createPostProvider: CreatePostProvider,
    private readonly paginationProvider: PaginationProvider<Post>,
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}

  public async create(@Body() createPostDto: CreatePostDto, user: ActiveUserData) {
    return this.createPostProvider.create(createPostDto, user);
  }

  public async findAll(
    postQuery: GetPostsDto,
    userId: number,
  ): Promise<Paginated<Post>> {
    console.log(userId);
    const user = this.usersService.findOneById(userId);

    const posts = await this.paginationProvider.paginateQuery({
        limit: postQuery.limit,
        page: postQuery.page,
      /*
      relations: {
        metaOptions: true,
        //tags: true,
        //author: true,
      },
      skip: (postQuery.page - 1) * postQuery.limit,
      take: postQuery.limit,
      */
      },
      this.postsRepository,
    );

    return posts;
  }

  public async update(patchPostDto: PatchPostDto) {
    let tags = undefined;
    let post = undefined;
    // Find the tags
    try {
      tags = await this.tagsService.findMultipleTags(patchPostDto.tags);
    } catch(error) {
      throw new RequestTimeoutException(
        'Unable to process your request at the moment, please try later',
        {
          description: 'Error connecting to the database',
        },
      );
    }

    /**
     * Number of tags need to be equal
     */
    if (!tags || tags.length !== patchPostDto.tags.length) {
      throw new BadRequestException(
        'Please check your tag Ids and ensure they are correct',
      );
    }
    // Find the post
    try {
      post = await this.postsRepository.findOneBy({
        id: patchPostDto.id,
      });
    } catch(error) {
      throw new RequestTimeoutException(
        'Unable to process your request at the moment, please try later',
        {
          description: 'Error connecting to the database',
        },
      );
    }

    if (!post) {
      throw new BadRequestException('The post ID does not exist');
    }
    // update the properties
    post.title = patchPostDto.title ?? post.title;
    post.content = patchPostDto.content ?? post.content;
    post.status = patchPostDto.status ?? post.status;
    post.postType = patchPostDto.postType ?? post.postType;
    post.slug = patchPostDto.slug ?? post.slug;
    post.featuredImageUrl = patchPostDto.featuredImageUrl ?? post.featuredImageUrl;
    post.publishOn = patchPostDto.publishOn ?? post.publishOn;
    // assign new tags
    post.tags = tags;
    // save the post and return
    try {
      await this.postsRepository.save(post);
    } catch(error) {
      throw new RequestTimeoutException(
        'Unable to process your request at the moment, please try later',
        {
          description: 'Error connecting to the database',
        },
      );
    }
    return post;
  }

  public async delete(id: number) {
    await this.postsRepository.delete(id);
    return { deleted: true, id };
  }
}
