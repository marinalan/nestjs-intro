import { Injectable } from '@nestjs/common';
import { CreatePostMetaOptionDto } from '../dtos/create-post-meta-option.dto';
import { Repository, W } from 'typeorm';
import { MetaOption } from '../meta-option.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class MetaOptionsService {
  constructor(
    /**
     * Inject metaOptionsRepository
     */
    @InjectRepository(MetaOption)
    private readonly metaOptionsRepository: Repository<MetaOption>,
  ) {}

  public async create(creatPostMetaOptionsDto: CreatePostMetaOptionDto) {
    const metaOption = this.metaOptionsRepository.create(
      creatPostMetaOptionsDto,
    );
    return await this.metaOptionsRepository.save(metaOption);
  }
}
