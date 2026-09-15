import { authenticate } from '../services/authService.js';
export function loginUser(req) { return authenticate('user1'); }