import { Body, Controller, Get, Inject, Post, Sse, UseGuards, MessageEvent } from '@nestjs/common';
import { ImageUploadsService } from './imageUploads.service';
import { ClientProxy } from '@nestjs/microservices';
import { MainAuthGuard } from '../auth/main-auth.guard';
import { User } from '../auth/user.decorator';
import { UserDto } from '../auth/user.dto';
import { Observable, from } from 'rxjs';

@Controller('image-uploads')
export class ImageUploadsController {
  constructor(
    private readonly imageUploadsService: ImageUploadsService,
    @Inject('rabbit-image-uploads-module')
    private readonly rabbitClient: ClientProxy,
  ) {}

  @Get('/get-image-upload-fields')
  @UseGuards(MainAuthGuard)
  async getImageUploadFields(): Promise<Record<string, string>> {
    return this.imageUploadsService.getImageUploadFields();
  }

  @Post('/start-processing')
  @UseGuards(MainAuthGuard)
  async startProcessing(@Body() req, @User() user: UserDto): Promise<void> {
    const { s3Key } = req;
    await this.rabbitClient.emit('image-upload', { s3Key, user }).toPromise();
  }

  @Sse('/on-finish-processing/')
  @UseGuards(MainAuthGuard)
  onFinishProcessing(@User() user: UserDto): Observable<MessageEvent> {
    console.log('when');
    return new Observable<MessageEvent>((subscriber) => {
      this.imageUploadsService.onFinish(user.id).then(() => {
        subscriber.next({ data: {} });
        subscriber.complete();
      });
    });
  }

  @Post('/finish-processing/')
  finishProcessing(@Body() { userId }: { userId: string }): void {
    console.log('yes');
    this.imageUploadsService.finishProcessing(userId);
  }
}
