import { Profile, Strategy, StrategyOptions } from 'passport-github';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      clientID: '2bd6867d114a463da985',
      clientSecret: 'ecf753e11ca5028914d0f8095f07aeda666254db',
      callbackURL: 'http://localhost:3001/auth/github/redirect',
    } as StrategyOptions);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<any> {
    console.log('profile', profile);
    const user = {
      id: profile.id,
      name: profile.username,
      avatar: (profile._json as any).avatar_url,
    };

    done(null, user);
  }
}
