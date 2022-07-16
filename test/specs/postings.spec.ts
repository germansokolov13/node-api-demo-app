import { expect } from 'chai';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { createUser } from '../utils/create-user';
import { initApp } from '../utils/init-app';
import { teardownMongo } from '../utils/teardown-mongo';

describe('Postings', function () {
  let app: INestApplication;

  before(async function () {
    app = await initApp();
  });

  after(async () => {
    await app.close();
    await teardownMongo();
  });

  it('should get latest postings', async function () {
    const response = await request(app.getHttpServer())
      .get('/postings/get-latest');
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array');
  });

  it('should create new postings', async function () {
    const [authToken, user] = createUser(app);

    const posting = {
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraph(),
    };

    const createResponse = await request(app.getHttpServer())
      .post('/postings/create')
      .auth(authToken, { type: 'bearer' })
      .send(posting);
    expect(createResponse.status).to.equal(201);

    const getListResponse = await request(app.getHttpServer())
      .get('/postings/get-latest');

    const saved = getListResponse.body[0];
    expect(getListResponse.status).to.equal(200);
    expect(saved.title).to.equal(posting.title);
    expect(saved.content).to.equal(posting.content);
    expect(saved).to.deep.include({ ...posting, user });
  });

  it('should not create empty postings', async function () {
    const [authToken] = createUser(app);

    const posting = {
      title: faker.lorem.sentence(),
      content: '   ',
    };

    await request(app.getHttpServer())
      .post('/postings/create')
      .auth(authToken, { type: 'bearer' })
      .send(posting);

    const getListResponse = await request(app.getHttpServer())
      .get('/postings/get-latest');
    const list = getListResponse.body;

    const lastContent = list.length > 0 ? list[0].content : null;
    expect(lastContent).to.not.equal('   ');
    const lastTitle = list.length > 0 ? list[0].title : null;
    expect(lastTitle).to.not.equal(posting.title);
  });

  it('should not let create message without auth', async function () {
    const posting = {
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraph(),
    };

    await request(app.getHttpServer())
      .post('/postings/create')
      .send(posting);

    const getListResponse = await request(app.getHttpServer())
      .get('/postings/get-latest');
    const list = getListResponse.body;

    const lastTitle = list.length > 0 ? list[0].title : null;
    expect(lastTitle).to.not.equal(posting.title);
  });

  it('should delete posting', async function () {
    const [authToken] = createUser(app);
    const posting = {
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraph(),
    };
    await request(app.getHttpServer())
      .post('/postings/create')
      .auth(authToken, { type: 'bearer' })
      .send(posting);

    const getListResponse = await request(app.getHttpServer())
      .get('/postings/get-latest');
    const createdRecord = getListResponse.body[0];
    expect(createdRecord.title).to.equal(posting.title);

    await request(app.getHttpServer())
      .post('/postings/delete')
      .auth(authToken, { type: 'bearer' })
      .send({ id: createdRecord._id });

    const getListAgainResponse = await request(app.getHttpServer())
      .get('/postings/get-latest');
    const list = getListAgainResponse.body;
    const lastTitle = list.length > 0 ? list[0].title : null;
    expect(lastTitle).to.not.equal(posting.title);
  });

  it('should not delete somebody else\'s posting', async function () {
    const [theirAuthToken] = createUser(app);
    const posting = {
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraph(),
    };
    await request(app.getHttpServer())
      .post('/postings/create')
      .auth(theirAuthToken, { type: 'bearer' })
      .send(posting);

    const getListResponse = await request(app.getHttpServer())
      .get('/postings/get-latest');
    const createdRecord = getListResponse.body[0];

    const [myAuthToken] = createUser(app);
    const deleteResponse = await request(app.getHttpServer())
      .post('/postings/delete')
      .auth(myAuthToken, { type: 'bearer' })
      .send({ id: createdRecord._id });
    expect(deleteResponse.status).to.equal(403);

    const getListAgainResponse = await request(app.getHttpServer())
      .get('/postings/get-latest');
    const recordRemaining = getListAgainResponse.body[0];
    expect(recordRemaining.title).to.equal(posting.title);
  });
});
