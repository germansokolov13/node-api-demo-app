import {
 BadRequestException, ForbiddenException, Injectable, NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { Posting, PostingDocument } from '../../schemas/posting.schema';
import { CreatePostingDto } from './createPosting.dto';
import { UserDto } from '../auth/user.dto';
import { ManticoreSearch } from './manticore-search.service';

const LATEST_POSTINGS_COUNT = 50;

@Injectable()
export class PostingsService {
  constructor(
    @InjectModel(Posting.name)
    private readonly PostingModel: Model<PostingDocument>,
    private readonly manticoreSearch: ManticoreSearch,
    @InjectConnection() private readonly mongoConnection: Connection,
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
    const savedRecord = await posting.save();

    try {
      // eslint-disable-next-line no-underscore-dangle
      await this.manticoreSearch.insert(savedRecord._id, posting);
    } catch (e) {
      await savedRecord.delete();
      throw e;
    }
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

  async delete(id: string, userId: string): Promise<void> {
    const posting = await this.PostingModel.findOne({
      _id: id,
      deletedAt: { $exists: false },
    });
    if (!posting) {
      throw new NotFoundException();
    }
    if (posting.user.id !== userId) {
      throw new ForbiddenException();
    }

    posting.deletedAt = new Date();
    await posting.save();
  }

  async getLatest(): Promise<Posting[]> {
    return this.PostingModel
      .find({ deletedAt: { $exists: false } })
      .sort({ createdAt: -1 })
      .limit(LATEST_POSTINGS_COUNT)
      .exec();
  }

  async search(searchWords: string): Promise<PostingDocument[]> {
    const ids = await this.manticoreSearch.searchIds(searchWords);

    return this.PostingModel
      .find({
        _id: { $in: ids },
        deletedAt: { $exists: false },
      })
      .sort({ createdAt: -1 })
      .exec();
  }
}
