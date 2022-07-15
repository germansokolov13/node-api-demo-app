import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { GithubStrategy } from './github.strategy';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { config } from '../../env-config';

const jwtModule = JwtModule.register({
  secret: config.auth.secret,
  signOptions: { expiresIn: config.auth.expiresIn },
});

@Module({
  controllers: [AuthController],
  imports: [
    PassportModule,
    jwtModule,
  ],
  providers: [GithubStrategy, JwtStrategy],
  exports: [jwtModule, JwtStrategy],
})
export class AuthModule {}
