import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { GithubStrategy } from './github-strategy';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwtStrategy';

@Module({
  controllers: [AuthController],
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'sdf sdf sfsd fsdf sdfsddddd',
      signOptions: { expiresIn: '20 minutes' },
    }),
  ],
  providers: [GithubStrategy, JwtStrategy],
})
export class AuthModule {}
