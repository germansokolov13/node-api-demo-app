import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostingsService } from './postings.service';
import { Posting } from '../../schemas/posting.schema';
import { CreatePostingDto } from './createPosting.dto';
import { MainAuthGuard } from '../auth/main-auth.guard';
import { User } from '../auth/user.decorator';
import { UserDto } from '../auth/user.dto';

@Controller('postings')
export class PostingsController {
  constructor(
    private readonly postingService: PostingsService,
  ) {}

  @Get('/get-latest')
  getLatest(): Promise<Posting[]> {
    return this.postingService.getLatest();
  }

  @Get('/search')
  search(@Query('query') query: string): Promise<Posting[]> {
    if (!query || query.replace(/\s/g, '').length === 0) {
      throw new BadRequestException('query is not defined');
    }
    return this.postingService.search(query);
  }

  @Post('/create')
  @UseGuards(MainAuthGuard)
  async createPosting(
    @Body() createPostingDto: CreatePostingDto,
    @User() user: UserDto,
  ): Promise<void> {
    await this.postingService.create(createPostingDto, user);
  }

  @Post('/delete')
  @UseGuards(MainAuthGuard)
  async delete(
    @Body('id') id: string,
    @User() user: UserDto,
  ): Promise<void> {
    await this.postingService.delete(id, user.id);
  }
}
