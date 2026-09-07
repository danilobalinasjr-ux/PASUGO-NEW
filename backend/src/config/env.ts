import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  db: {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 3306),
    name: process.env.DB_NAME ?? 'pasugo_db',
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.RESEND_FROM_EMAIL,
  },
  otp: {
    expirationMinutes: Number(process.env.OTP_EXPIRATION_MINUTES ?? 15),
    maxAttempts: Number(process.env.OTP_MAX_ATTEMPTS ?? 5),
    resendCooldownSeconds: Number(process.env.OTP_RESEND_COOLDOWN_SECONDS ?? 60),
    maxRequestsPerHour: Number(process.env.OTP_MAX_REQUESTS_PER_HOUR ?? 5),
    bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS ?? 12),
  },
};
