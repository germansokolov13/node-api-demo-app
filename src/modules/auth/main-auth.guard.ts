import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Use this guard as default auth http guard for all protected methods
@Injectable()
export class MainAuthGuard extends AuthGuard('jwt') {}
