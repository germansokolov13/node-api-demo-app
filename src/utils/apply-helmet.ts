import { INestApplication } from '@nestjs/common/interfaces/nest-application.interface';
import helmet from 'helmet';

// Apply helmet security headers but make some exceptions for Auth
export function applyHelmet(app: INestApplication): void {
  const AUTH_ROUTE = '/auth/github/';

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        scriptSrc: [
          (req) => (req.url.startsWith(AUTH_ROUTE) ? "'unsafe-inline'" : "'self'"),
        ],
      },
    },
    crossOriginOpenerPolicy: false,
  }));

  app.use((req, res, next) => {
    if (req.url.startsWith(AUTH_ROUTE)) {
      res.header('Cross-Origin-Opener-Policy', 'unsafe-none');
    } else {
      res.header('Cross-Origin-Opener-Policy', 'same-origin');
    }
    next();
  });
}
