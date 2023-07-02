import { Router } from 'express'; //import express
import { battle } from '@/controllers/battle';

const router = Router();

router.post('/', battle);

export default router;
