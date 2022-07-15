import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Posting, PostingDocument } from '../../schemas/posting.schema';
import { CreatePostingDto } from './createPosting.dto';
import { UserDto } from '../auth/user.dto';
import { SphinxService } from './sphinx.service';

const LATEST_POSTINGS_COUNT = 50;

@Injectable()
export class PostingsService {
  constructor(
    @InjectModel(Posting.name)
    private readonly PostingModel: Model<PostingDocument>,
    private readonly sphinxService: SphinxService,
  ) {}

  async create(createPostingDto: CreatePostingDto, user: UserDto): Promise<void> {
    const title = createPostingDto.title.trim();
    const content = createPostingDto.content.trim();
    if (!title || !content) {
      throw new BadRequestException('Blank fields not allowed');
    }

    const posting = new this.PostingModel({
      title,
      content,
      user: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
      },
    });
    await posting.save();
  }

  async createImage(s3Key: string, user: UserDto): Promise<void> {
    const posting = new this.PostingModel({
      s3Key,
      user: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
      },
    });
    await posting.save();
  }

  async getLatest(): Promise<Posting[]> {
    return this.PostingModel
      .find()
      .sort({ createdAt: -1 })
      .limit(LATEST_POSTINGS_COUNT)
      .exec();
  }

  async querySearch(searchWords: string): Promise<Posting[]> {
    const query = 'SELECT * FROM postings_index WHERE MATCH(?) LIMIT 50 OPTION ranker=bm25';
    const ids = await this.sphinxService.searchIds(query, searchWords);

    return this.PostingModel
      .find({
        _id: { $in: ids },
      })
      .sort({ createdAt: -1 })
      .exec();
  }
}
