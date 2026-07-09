import dotenv from 'dotenv';
dotenv.config();

const requiredEnv = [
  'JWT_SECRET',
  'DATABASE_URL',
  'REDIS_PASSWORD',
  'JWT_SECRET'
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`❌ FATAL CONFIG ERROR: Variable "${key}" is missing in .env file!`);
    process.exit(1);
  }
}

export const config = {
  jwtSecret: process.env.JWT_SECRET as string,
  databaseUrl: process.env.DATABASE_URL as string,
  port: process.env.PORT || 5000,
  redisPassword: process.env.REDIS_PASSWORD as string,
};