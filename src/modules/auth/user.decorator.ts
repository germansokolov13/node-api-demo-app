import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserDto } from './user.dto';

// Decorator to inject user into controller method
export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserDto => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
