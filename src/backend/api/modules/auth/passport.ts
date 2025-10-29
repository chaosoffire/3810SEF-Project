import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import * as userRepo from '../../../database/model/user/user.repository';

type DbUserCredential = {
  credential?: {
    username?: string;
    passwordHash?: string;
  };
};

// Configure LocalStrategy to authenticate with username and password
passport.use(
  new LocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'password',
      session: false,
    },
    async (
      username: string,
      password: string,
      done: (err: unknown, user?: { username: string } | false) => void
    ) => {
      try {
        const raw = await userRepo.getUserByUsername(username);
        const user = raw as unknown as DbUserCredential | null;
        if (!user) return done(null, false);
        const passwordHash = user.credential?.passwordHash;
        if (!passwordHash) return done(null, false);
        const ok = await bcrypt.compare(password, passwordHash);
        if (!ok) return done(null, false);
        // success: return minimal user info
        const uname = user.credential?.username ?? username;
        return done(null, { username: uname });
      } catch (err) {
        return done(err);
      }
    }
  )
);

export default passport;
