import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { ImageUploadsService } from './imageUploads.service';
import { ClientProxy } from '@nestjs/microservices';

@Controller('image-uploads')
export class ImageUploadsController {
  constructor(
    private readonly imageUploadsService: ImageUploadsService,
    @Inject('rabbit-image-uploads-module')
    private readonly rabbitClient: ClientProxy,
  ) {}

  @Get('/get-image-upload-fields')
  async getImageUploadFields(): Promise<Record<string, string>> {
    return this.imageUploadsService.getImageUploadFields();
  }

  @Post('/start-processing')
  async startProcessing(@Body() req): Promise<void> {
    const { s3Key } = req;
    await this.rabbitClient.emit('image-upload', { s3Key }).toPromise();
  }
}
