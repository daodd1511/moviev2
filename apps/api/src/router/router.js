import express from 'express';
import authRouter from './auth.routes.js';
import listRouter from './list.routes.js';
import libraryEntryRouter from './library-entry.routes.js';
import userRouter from './user.routes.js';

const router = express.Router();
router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/list', listRouter);
router.use('/library/entries', libraryEntryRouter);
export default router;
