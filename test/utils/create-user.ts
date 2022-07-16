import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { faker } from '@faker-js/faker';
import { UserDto } from '../../src/modules/auth/user.dto';

export function createUser(app: INestApplication): [string, UserDto] {
  const user = {
    name: faker.name.findName(),
    id: faker.random.numeric(6),
    avatar: faker.image.abstract(20, 20),
  };
  const jwtService = app.get(JwtService);
  const authToken = jwtService.sign(user);

  return [authToken, user];
}
