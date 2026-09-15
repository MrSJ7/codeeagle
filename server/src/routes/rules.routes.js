import { Router } from 'express';
import { handleRulesRequest } from '../controllers/review.controller.js';

const router = Router();

router.get('/', handleRulesRequest);

export default router;
