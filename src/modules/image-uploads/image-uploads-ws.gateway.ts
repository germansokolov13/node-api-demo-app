import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WsResponse,
} from '@nestjs/websockets';
import { ImageProcessingRequestDto } from './image-processing-request.dto';
import { ImageProcessingResponseDto } from './image-processing-response.dto';
import { ImageUploadsService } from './image-uploads.service';
import { AppLogger } from '../../utils/logger';

@WebSocketGateway()
export class ImageUploadsWsGateway {
  constructor(
    private readonly imageUploadsService: ImageUploadsService,
  ) {}

  @SubscribeMessage('image-processing')
  async processImage(
    @MessageBody() message: ImageProcessingRequestDto,
  ): Promise<WsResponse<ImageProcessingResponseDto>> {
    const { isSuccess, error } = await this.imageUploadsService.processImage(message);

    return {
      event: 'image-processing',
      data: { isSuccess, error },
    };
  }
}
