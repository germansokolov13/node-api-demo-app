import { Pool, createPool } from 'mysql';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Posting, PostingDocument } from '../../schemas/posting.schema';
import { Model } from 'mongoose';
import { CreatePostingDto } from './createPosting.dto';
import { UserDto } from '../auth/user.dto';

@Injectable()
export class PostingsService {
  sphinxConnectionPool: Pool;

  constructor(
    @InjectModel(Posting.name)
    private readonly postingModel: Model<PostingDocument>,
  ) {
    this.sphinxConnectionPool = createPool({
      connectionLimit: 10,
      host: 'localhost',
      port: 9306,
    });
  }

  async create(createPostingDto: CreatePostingDto, user: UserDto): Promise<void> {
    const posting = new this.postingModel({
      title: createPostingDto.title,
      content: createPostingDto.content,
      user: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
      },
    });
    await posting.save();
  }

  async createImage(s3Key: string, user: UserDto): Promise<void> {
    const posting = new this.postingModel({
      s3Key: s3Key,
      user: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
      },
    });
    await posting.save();
  }

  async getList(): Promise<Posting[]> {
    return this.postingModel.find().sort({ createdAt: -1 }).limit(50).exec();
  }

  async querySearch(searchWords: string): Promise<Posting[]> {
    const indexHits: { mongoid: string }[] = await new Promise(
      (resolve, reject) => {
        const query =
          'SELECT * FROM postings_index WHERE MATCH(?) LIMIT 50 OPTION ranker=bm25';
        this.sphinxConnectionPool.query(query, [searchWords], (err, result) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(result);
        });
      },
    );

    const ids = indexHits.map((hit) => hit.mongoid);

    return this.postingModel
      .find({
        _id: { $in: ids },
      })
      .sort({ createdAt: -1 })
      .exec();
  }
}
