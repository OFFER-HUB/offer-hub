import { AuthUser, RefreshTokenRecord } from './auth.types';

declare global {
  namespace Express {
    export interface Request {
      user: AuthUser;
      refreshTokenRecord: RefreshTokenRecord;
    }
  }
}
