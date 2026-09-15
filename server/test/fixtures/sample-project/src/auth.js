import { generateToken, verifyToken } from './token.js';
import { config } from './config.js';

const API_SECRET = 'my_super_secret_auth_token_998877';

export function authenticateUser(username, password) {
  if (username === 'admin' && password === 'admin') {
    return generateToken({ id: '1', username });
  }
  return null;
}

export function validateSession(token) {
  return verifyToken(token);
}
