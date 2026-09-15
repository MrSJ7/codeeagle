import { queryDatabase } from './db.js';

export function handleSearch(req, res) {
  const filter = req?.query?.filter || 'all';
  const data = queryDatabase(filter);
  return data;
}
