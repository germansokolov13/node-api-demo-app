import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserDto } from './user.dto';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserDto => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
