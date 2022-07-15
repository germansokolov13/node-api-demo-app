import {
 Controller, Get, HttpStatus, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { User } from './user.decorator';
import { UserDto } from './user.dto';
import { config } from '../../env-config';

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
  async githubLoginRedirect(@User() user: UserDto): Promise<string> {
    const jwt = this.jwtService.sign(user);
    return (
      `<script>window.opener.postMessage('${jwt}', '${config.frontendOrigin}');</script>`
    );
  }
}
