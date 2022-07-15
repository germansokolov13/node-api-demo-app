import { Profile, Strategy, StrategyOptions } from 'passport-github';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { config } from '../../env-config';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      clientID: config.githubOAuth.clientID,
      clientSecret: config.githubOAuth.clientSecret,
      callbackURL: config.githubOAuth.clientSecret,
    } as StrategyOptions);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<any> {
    const user = {
      id: profile.id,
      name: profile.username,
      // eslint-disable-next-line no-underscore-dangle
      avatar: (profile._json as any).avatar_url,
    };

    done(null, user);
  }
}
