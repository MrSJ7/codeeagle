import { createPost } from '../models/post.js';
export function getPosts() { return [createPost('Hello', '1')]; }