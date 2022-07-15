import { INestApplication, INestMicroservice } from '@nestjs/common';
import * as request from 'supertest';
import { WebSocket } from 'ws';
import { expect } from 'chai';
import { readFileSync } from 'fs';
import * as sharp from 'sharp';
import { initApp } from '../utils/init-app';
import { teardownMongo } from '../utils/teardown-mongo';
import { initConsumerApp } from '../utils/init-consumer-app';
import { createUser } from '../utils/create-user';
import { config } from '../../src/env-config';

describe('Image uploads', function () {
  let app: INestApplication;
  let consumerApp: INestMicroservice;

  before(async function () {
    app = await initApp();
    consumerApp = await initConsumerApp();
  });

  after(async () => {
    await consumerApp.close();
    await app.close();
    await teardownMongo();
  });

  it('should upload images', async function () {
    const [authToken] = createUser(app);

    const { body: signedFields } = await request(app.getHttpServer())
      .get('/image-uploads/get-image-upload-fields')
      .auth(authToken, { type: 'bearer' });

    const image = readFileSync(`${__dirname}/../data/example.jpg`);

    const uploadRequest = request(config.s3.endpoint)
      .post(`/${config.s3.uploadBucket}`)
      .field('Content-Type', 'image/jpg');
    Object.keys(signedFields).forEach((key) => {
      uploadRequest.field(key, signedFields[key]);
    });
    const uploadResponse = await uploadRequest.attach('file', image);
    expect(uploadResponse.status).to.equal(204);

    const s3Key = signedFields.key;

    const appAddress = app.getHttpServer().listen().address();
    const wsUrl = `ws://[${appAddress.address}]:${appAddress.port}`;
    const socket = new WebSocket(wsUrl);

    const isSuccess = await new Promise((resolve) => {
      socket.onopen = () => {
        const eventName = 'image-processing';
        const initMessage = {
          event: eventName,
          data: { authToken, s3Key },
        };
        socket.send(JSON.stringify(initMessage));
        socket.onmessage = (event) => {
          const { data } = JSON.parse(event.data);
          socket.close();
          resolve(data.isSuccess);
        };
      };
    });

    expect(isSuccess).to.be.equal(true);

    const downloadResponse = await request(config.s3.endpoint)
      .get(`/${config.s3.servedBucket}/${s3Key}`);
    expect(downloadResponse.status).to.equal(200);
    const outputImage = downloadResponse.body;
    const outputMetadata = await sharp(outputImage).metadata();
    expect(outputMetadata.format).to.equal('jpeg');
    expect(outputMetadata.width).to.be.lessThanOrEqual(2000);
    expect(outputMetadata.height).to.be.lessThanOrEqual(400);
  });
});
