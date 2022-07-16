import {
 BadRequestException, ForbiddenException, Injectable, NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Posting, PostingDocument } from '../../schemas/posting.schema';
import { CreatePostingDto } from './createPosting.dto';
import { UserDto } from '../auth/user.dto';

const LATEST_POSTINGS_COUNT = 50;

@Injectable()
export class PostingsService {
  constructor(
    @InjectModel(Posting.name)
    private readonly PostingModel: Model<PostingDocument>,
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
}
