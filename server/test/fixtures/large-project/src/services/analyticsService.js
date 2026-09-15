import { logAudit } from '../models/audit.js';
export function trackEvent(ev) { return logAudit(ev); }