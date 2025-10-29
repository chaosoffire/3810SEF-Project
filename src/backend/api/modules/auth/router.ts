import express from 'express';
import passport from './passport';

export const authRouter = express.Router({ mergeParams: true });

// Initialize passport for this router
authRouter.use(passport.initialize());

export default authRouter;
