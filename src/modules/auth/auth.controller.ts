import { Controller, Get, HttpStatus, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { User } from './user.decorator';
import { UserDto } from './user.dto';
import { MainAuthGuard } from './main-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly jwtService: JwtService,
  ) {}

  @Get('/github')
  @UseGuards(AuthGuard('github'))
  async githubLogin(): Promise<any> {
    return HttpStatus.OK;
  }

  @Get('/github/redirect')
  @UseGuards(AuthGuard('github'))
  async githubLoginRedirect(@Req() req): Promise<string> {
    const jwt = this.jwtService.sign(req.user);
    return (
      "<script>window.opener.postMessage('" +
      jwt +
      "', 'http://localhost:3000');</script>"
    );
  }

  @Get('/profile')
  @UseGuards(MainAuthGuard)
  getProfile(@User() user: UserDto) {
    return user;
  }
}