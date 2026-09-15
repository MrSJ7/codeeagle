import { Router } from 'express';
import {
  handleVerifyPatch,
  handleApplyPatch,
  handleVerifyAiPatch,
  handleApplyAiPatch,
} from '../controllers/patch.controller.js';

const router = Router();

router.post('/verify', handleVerifyPatch);
router.post('/apply', handleApplyPatch);
router.post('/verify-ai', handleVerifyAiPatch);
router.post('/apply-ai', handleApplyAiPatch);

export default router;
