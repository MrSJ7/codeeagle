import { config } from './config.js';

export function generateToken(user) {
  if (!user || !user.id) {
    throw new Error('User identity required');
  }
  return `token_${user.id}_${Date.now()}`;
}

export function verifyToken(token) {
  if (!token || typeof token !== 'string') {
    return false;
  }
  return token.startsWith('token_');
}
