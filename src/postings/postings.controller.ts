import { BadRequestException, Body, Controller, Get, Post, Query } from '@nestjs/common';
import { PostingsService } from './postings.service';
import { Posting } from '../schemas/posting.schema';
import { CreatePostingDto } from './createPosting.dto';

@Controller('postings')
export class PostingsController {
  constructor(
    private postingService: PostingsService,
  ) {}

  @Get('/get-List')
  getList(): Promise<Posting[]> {
    return this.postingService.getList();
  }

  @Get('/search')
  search(@Query('query') query: string): Promise<Posting[]> {
    if (!query || query.replace(/\s/g, '').length === 0) {
      throw new BadRequestException('query is not defined');
    }
    return this.postingService.querySearch(query);
  }

  @Post('/create')
  async createPosting(@Body() createPostingDto: CreatePostingDto): Promise<void> {
    await this.postingService.create(createPostingDto);
  }
}
