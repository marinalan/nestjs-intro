import { Body, Controller, Delete, Inject, ParseIntPipe, Post, Query } from '@nestjs/common';
import { TagsService } from './providers/tags.service';
import { CreateTagDto } from './dtos/create-tag.dto';

@Controller('tags')
export class TagsController {

  constructor(
    @Inject()
    private readonly tagsService: TagsService,
  ) {}

  @Post()
  public create(@Body() createTagDto: CreateTagDto) {
    return this.tagsService.create(createTagDto);
  }

  @Delete()
  public async delete(@Query('id', ParseIntPipe) id: number) {
    return this.tagsService.delete(id);
  }

  @Delete('soft-delete')
  public async softDelete(@Query('id', ParseIntPipe) id: number) {
    return this.tagsService.softRemove(id);
  }
}
