import { INestApplication } from '@nestjs/common';
import { Connection, ConnectOptions } from 'mongoose';
import mongoose from 'mongoose';
import { config } from '../../src/env-config';

export async function teardownMongo(): Promise<void> {
  const mongoConnection: Connection = await mongoose.createConnection(config.mongodb.url, {
    dbName: config.mongodb.dbName,
    user: config.mongodb.user,
    pass: config.mongodb.pass,
  } as ConnectOptions);
  await mongoConnection.dropDatabase();
  await mongoConnection.close();
}
