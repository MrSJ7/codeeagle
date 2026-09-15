export const config = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  tokenExpirySeconds: 3600,
};

export function getDatabaseUrl() {
  return process.env.DATABASE_URL || 'postgres://localhost:5432/app';
}
