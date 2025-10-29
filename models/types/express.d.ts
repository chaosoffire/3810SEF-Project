import 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    runtime?: {
      username: string;
      role: 'admin' | 'user' | 'test';
    };
  }
}

export {};
