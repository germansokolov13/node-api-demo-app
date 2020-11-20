import { Pool, createPool } from 'mysql';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Posting, PostingDocument } from '../schemas/posting.schema';
import { Model } from 'mongoose';
import { CreatePostingDto } from './createPosting.dto';

@Injectable()
export class PostingsService {
  sphinxConnectionPool: Pool;

  constructor(
    @InjectModel(Posting.name) private postingModel: Model<PostingDocument>,
  ) {
    this.sphinxConnectionPool = createPool({
      connectionLimit: 10,
      host: 'localhost',
      port: 9306,
    });
  }

  async create(createPostingDto: CreatePostingDto): Promise<void> {
    const posting = new this.postingModel(createPostingDto);
    await posting.save();
  }

  async getList(): Promise<Posting[]> {
    return this.postingModel
      .find()
      .sort([['createdAt', -1]])
      .exec();
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

    return this.postingModel
      .find({
        _id: { $in: indexHits.map((hit) => hit.mongoid as any) },
      })
      .sort([['createdAt', -1]])
      .exec();
  }
}
