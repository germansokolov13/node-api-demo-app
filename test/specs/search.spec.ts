import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { expect } from 'chai';
import { faker } from '@faker-js/faker';
import { initApp } from '../utils/init-app';
import { teardownMongo } from '../utils/teardown-mongo';
import { createUser } from '../utils/create-user';
import { PostingDocument } from '../../src/schemas/posting.schema';

describe('Search', function () {
  let app: INestApplication;

  before(async function () {
    app = await initApp();
  });

  after(async () => {
    await app.close();
    await teardownMongo();
  });

  it('should find messages with full-text search', async function () {
    const [authToken] = createUser(app);
    const searchWord = faker.lorem.word(8);
    const posting = {
      title: `${faker.lorem.sentence()} ${searchWord} ${faker.lorem.sentence()} `,
      content: faker.lorem.paragraph(),
    };

    await request(app.getHttpServer())
      .post('/postings/create')
      .auth(authToken, { type: 'bearer' })
      .send(posting);

    const searchResponse = await request(app.getHttpServer())
      .get(`/postings/search?query=${searchWord}`);
    const items: PostingDocument[] = searchResponse.body;
    const found = items.findIndex((item) => item.title === posting.title.trim());

    expect(found).not.to.equal(-1);
  });

  it('should not find deleted messages', async function () {
    const [authToken] = createUser(app);
    const searchWord = faker.lorem.word(8);
    const posting = {
      title: `${faker.lorem.sentence()} ${searchWord} ${faker.lorem.sentence()} `,
      content: faker.lorem.paragraph(),
    };
    await request(app.getHttpServer())
      .post('/postings/create')
      .auth(authToken, { type: 'bearer' })
      .send(posting);

    const getListResponse = await request(app.getHttpServer())
      .get('/postings/get-latest');
    const createdRecord = getListResponse.body[0];
    await request(app.getHttpServer())
      .post('/postings/delete')
      .auth(authToken, { type: 'bearer' })
      .send({ id: createdRecord._id });

    const searchResponse = await request(app.getHttpServer())
      .get(`/postings/search?query=${searchWord}`);
    const items: PostingDocument[] = searchResponse.body;
    const found = items.findIndex((item) => item.title === posting.title.trim());

    expect(found).to.equal(-1);
  });
});
