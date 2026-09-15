import { createUser } from '../models/user.js';
import { signToken } from './tokenService.js';
export function authenticate(username) { const u = createUser(username); return signToken(u); }