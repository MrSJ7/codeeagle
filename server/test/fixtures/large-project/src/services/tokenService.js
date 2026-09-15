import { secretKey } from '../utils/crypto.js';
export function signToken(user) { return 'tok_' + user.name; }