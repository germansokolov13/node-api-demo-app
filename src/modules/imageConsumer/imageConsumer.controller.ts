import * as sharp from 'sharp';
import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { InjectS3, S3 } from 'nestjs-s3';
import { Create } from 'sharp';

sharp.cache(false);

@Controller()
export class ImageConsumerController {
  constructor(@InjectS3() private readonly s3: S3) {}

  getRect(metadata, brightness: number) {
    return {
      create: {
        width: metadata.width,
        height: metadata.height,
        channels: 3,
        background: { r: brightness, g: brightness, b: brightness },
      } as Create,
    };
  }

  @EventPattern('image-upload')
  async processImage({ s3Key }): Promise<void> {
    console.log('got from q', s3Key);
    const params = {
      Bucket: 'image-uploads',
      Key: s3Key,
    };
    const image = await this.s3.getObject(params).promise();
    const from: Buffer = image.Body as any;

    const sharpImage = sharp(from).grayscale();

    const DARK = 100;
    const LIGHT = 200;

    // const lights = await sharpImage.clone()
    //   .composite([
    //     {
    //       input: await sharpImage.clone().threshold(200).toBuffer(),
    //       blend: 'multiply',
    //     },
    //   ])
    //   .toBuffer();
    //
    // const darks = await sharpImage.clone()
    //   .composite([
    //     {
    //       input: await sharp(await sharpImage.clone().threshold(100).toBuffer())
    //         .negate()
    //         .toBuffer(),
    //       blend: 'multiply',
    //     },
    //   ])
    //   .toBuffer();
    //
    // const a = await sharpImage.clone()
    //   .composite([
    //     {
    //       input: await sharpImage.clone().threshold(100).toBuffer(),
    //       blend: 'multiply',
    //     },
    //   ])
    //   .toBuffer();
    // const mids = await sharpImage.clone()
    //   .composite([
    //     {
    //       input: await sharp(await sharpImage.clone().threshold(200).toBuffer())
    //         .negate()
    //         .toBuffer(),
    //       blend: 'multiply',
    //     },
    //   ])
    //   .toBuffer();


    const above100 = await sharpImage.clone().threshold(125).toBuffer();
    const above200 = await sharpImage.clone().threshold(175).toBuffer();
    const below200 = await sharp(above200).negate().toBuffer();
    const below100 = await sharp(above100).negate().toBuffer();

    const lights = await sharpImage.clone()
      .composite([
        {
          input: above200,
          blend: 'multiply',
        },
      ])
      // .tint({ r: 167, g: 91, b: 181 })
      .tint({ r: 91, g: 156, b: 181 })
      .toBuffer();

    const mids = await sharpImage.clone()
      .composite([
        {
          input: above100,
          blend: 'multiply',
        },
        {
          input: below200,
          blend: 'multiply',
        },
      ])
      .tint({ r: 167, g: 91, b: 181 })
      .toBuffer();

    const darks = await sharpImage.clone()
      .composite([
        {
          input: below100,
          blend: 'multiply',
        },
      ])
      .tint({ r: 249, g: 255, b: 46 })
      .toBuffer();

    const res = await sharp(lights)
      .composite([
        {
          input: darks,
          blend: 'add',
        },
        {
          input: mids,
          blend: 'add',
        },
      ])
      .toBuffer();

    const putParams = {
      Body: res,
      ContentType: image.ContentType,
      Bucket: 'image-upload-results',
      Key: s3Key,
    };
    await this.s3.putObject(putParams).promise();
    // const putParams1 = {
    //   Body: mids,
    //   ContentType: image.ContentType,
    //   Bucket: 'image-upload-results',
    //   Key: s3Key+'1',
    // };
    // await this.s3.putObject(putParams1).promise();
    // const putParams2 = {
    //   Body: darks,
    //   ContentType: image.ContentType,
    //   Bucket: 'image-upload-results',
    //   Key: s3Key+'2',
    // };
    // await this.s3.putObject(putParams2).promise();
    console.log('done');
  }
}
