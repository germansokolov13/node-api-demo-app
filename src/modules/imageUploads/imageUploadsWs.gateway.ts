import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@WebSocketGateway()
export class ImageUploadsWsGateway {
  constructor(
    private readonly jwtService: JwtService,
    @Inject('rabbit-image-uploads-module')
    private readonly rabbitClient: ClientProxy,
  ) {}

  @SubscribeMessage('image-processing')
  async processImage(
    // @User() user: UserDto,
    @MessageBody() message
  ): Promise<WsResponse<any>> {
    const { authToken, s3Key } = message;
    let user;
    try {
      user = this.jwtService.verify(authToken);
    } catch (e) {
      return {
        event: 'image-processing',
        data: { isSuccess: false, message: 'auth fail' },
      };
    }

    const result = await this.rabbitClient.send('image-upload', { s3Key, user }).toPromise();
    console.log(result);

    return {
      event: 'image-processing',
      data: { isSuccess: true },
    };
  }
}