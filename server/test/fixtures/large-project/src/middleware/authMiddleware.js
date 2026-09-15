import { signToken } from '../services/tokenService.js';
export function checkAuth(token) { return !!token; }