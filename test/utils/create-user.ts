import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserDto } from '../../src/modules/auth/user.dto';

export function createUser(app: INestApplication): [string, UserDto] {
  const user = {
    name: 'John',
    id: '17',
    avatar: 'http://somewhere/17',
  };
  const jwtService = app.get(JwtService);
  const authToken = jwtService.sign(user);

  return [authToken, user];
}
