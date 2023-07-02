import { Router } from 'express';
import battleRoute from './battle';

const router = Router();

router.use('/battle', battleRoute);

export default router;
