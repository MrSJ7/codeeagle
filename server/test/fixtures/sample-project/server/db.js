export function queryDatabase(userFilter) {
  // Vulnerable to SQL injection via concatenation
  const sql = "SELECT * FROM accounts WHERE status = 'active' AND owner = " + userFilter;
  return { sql, results: [] };
}
