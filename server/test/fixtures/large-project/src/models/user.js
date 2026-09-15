import { ROLES } from '../config/constants.js';
export function createUser(name) { return { name, role: ROLES[1] }; }