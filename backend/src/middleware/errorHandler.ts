import type { NextFunction, Request, Response } from 'express';

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
}

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  const statusCode = (error as Error & { statusCode?: number }).statusCode ?? 500;

  res.status(statusCode).json({
    success: false,
    error: error.message || 'Internal server error',
  });
}
