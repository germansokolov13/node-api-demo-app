import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { createPool, Pool } from 'mysql';
import { config } from '../../env-config';
import { Posting, PostingDocument } from '../../schemas/posting.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class SphinxService implements OnModuleDestroy {
  sphinxConnectionPool: Pool;

  constructor(
    @InjectModel(Posting.name)
    private readonly PostingModel: Model<PostingDocument>,
  ) {
    this.sphinxConnectionPool = createPool({
      connectionLimit: config.sphinx.connectionLimit,
      host: config.sphinx.host,
      port: config.sphinx.port,
    });
  }

  async onModuleDestroy(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.sphinxConnectionPool.end((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async querySearch(searchWords: string): Promise<Posting[]> {
    const query = 'SELECT * FROM postings_index WHERE MATCH(?) LIMIT 50 OPTION ranker=bm25';
    const ids = await this.searchIds(query, searchWords);

    return this.PostingModel
      .find({
        _id: { $in: ids },
        deletedAt: { $exists: false },
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  private async searchIds(query: string, searchWords: string): Promise<string[]> {
    const indexHits: { mongoid: string }[] = await new Promise((resolve, reject) => {
      this.sphinxConnectionPool.query(query, [searchWords], (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });

    return indexHits.map((hit) => hit.mongoid);
  }
}