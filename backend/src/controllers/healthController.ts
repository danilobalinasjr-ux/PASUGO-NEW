import type { Request, Response } from 'express';

import { testDatabaseConnection } from '../config/database.js';

export async function healthCheck(req: Request, res: Response) {
  try {
    await testDatabaseConnection();

    res.status(200).json({
      success: true,
      status: 'ok',
      service: 'pasugo-backend',
      database: 'pasugo_db',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV ?? 'development',
      requestUrl: req.originalUrl,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown database error';

    res.status(503).json({
      success: false,
      status: 'db_unavailable',
      service: 'pasugo-backend',
      database: 'pasugo_db',
      error: message,
    });
  }
}
