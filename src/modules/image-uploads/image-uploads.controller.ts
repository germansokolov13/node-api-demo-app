import { Controller, Get, UseGuards } from '@nestjs/common';
import { ImageUploadsService } from './image-uploads.service';
import { MainAuthGuard } from '../auth/main-auth.guard';
import { User } from '../auth/user.decorator';
import { UserDto } from '../auth/user.dto';

@Controller('image-uploads')
export class ImageUploadsController {
  constructor(
    private readonly imageUploadsService: ImageUploadsService,
  ) {}

  // Get pre-signed S3 upload fields to let user upload a file browser-to-S3 directly
  @Get('/get-image-upload-fields')
  @UseGuards(MainAuthGuard)
  async getImageUploadFields(
    @User() user: UserDto,
  ): Promise<Record<string, string>> {
    return this.imageUploadsService.getImageUploadFields(user.id);
  }
}
