import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { createPool, Pool } from 'mysql';
import { config } from '../../env-config';

@Injectable()
export class SphinxService implements OnModuleDestroy {
  sphinxConnectionPool: Pool;

  constructor() {
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

  async searchIds(query: string, searchWords: string): Promise<string[]> {
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