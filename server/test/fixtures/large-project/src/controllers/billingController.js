import { processCharge } from '../services/paymentService.js';
export function charge(amount) { return processCharge(amount); }