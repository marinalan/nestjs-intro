import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Patch,
  Query,
  ParseIntPipe,
  Delete,
  Req,
} from '@nestjs/common';
import { PostsService } from './providers/posts.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreatePostDto } from './dtos/create-post.dto';
import { PatchPostDto } from './dtos/patch-post.dto';
import { GetPostsDto } from './dtos/get-posts.dto';
import { REQUEST_USER_KEY } from 'src/auth/constants/auth.constants';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';

@Controller('posts')
@ApiTags('Posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  /*
   * GET localhost:3000/posts/:userId
   */
  @Get('/:userId?')
  public getPosts(
    @Param('userId') userId: number,
    @Query() postQuery: GetPostsDto,
  ) {
    console.log(postQuery);
    return this.postsService.findAll(postQuery, userId);
  }

  @ApiOperation({
    summary: 'Creates a new blog post',
  })
  @ApiResponse({
    status: 201,
    description: 'You get a  201 response if your post is created successfully',
  })
  @Post()
  public createPost(
    @Body() createPostDto: CreatePostDto, 
    @ActiveUser() user: ActiveUserData,
  ) {
    console.log(user);
    return this.postsService.create(createPostDto, user);
  }

  @ApiOperation({
    summary: 'Updates an existing blog post',
  })
  @ApiResponse({
    status: 200,
    description: 'A 200 response if post is updated successfully',
  })
  @Patch()
  public updatePost(@Body() patchPostsDto: PatchPostDto) {
    return this.postsService.update(patchPostsDto);
  }

  @Delete()
  public deletePost(@Query('id', ParseIntPipe) id: number) {
    return this.postsService.delete(id);
  }
}

