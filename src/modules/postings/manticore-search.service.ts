import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PostingDocument } from '../../schemas/posting.schema';
import { config } from '../../env-config';

@Injectable()
export class ManticoreSearch {
  async insert(mongoId: string, posting: PostingDocument): Promise<void> {
    const json = {
      index: 'postings',
      doc: {
        title: posting.title,
        content: posting.content,
        mongo_id: mongoId,
      },
    };

    await axios.post(`${config.manticore.url}/insert`, json);
  }

  async searchIds(searchWords: string): Promise<string[]> {
    const json = {
      index: 'postings',
      query: {
          query_string: searchWords,
      },
      limit: 50,
      _source: ['mongo_id'],
    };
    const results = await axios.post(`${config.manticore.url}/search`, json);

    // eslint-disable-next-line no-underscore-dangle
    return results.data.hits.hits.map((hit) => hit._source.mongo_id);
  }
}
