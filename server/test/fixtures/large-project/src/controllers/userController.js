import { createUser } from '../models/user.js';
export function getUser(id) { return createUser('user_' + id); }