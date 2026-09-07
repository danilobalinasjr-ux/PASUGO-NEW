import type { NextFunction, Request, Response } from 'express';

import {
  completeRegistration,
  initiateRegistration,
  RegistrationError,
  resendRegistrationCode,
  verifyRegistrationCode,
} from '../services/registrationService.js';

function stringField(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function handleError(error: unknown, next: NextFunction, res: Response) {
  if (error instanceof RegistrationError) {
    res.status(error.statusCode).json({ success: false, error: error.message });
    return;
  }
  next(error);
}

export async function initiateRegistrationController(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await initiateRegistration(stringField(req.body?.email), stringField(req.body?.fullName), stringField(req.body?.password));
    res.status(201).json({ success: true, ...result, expiresIn: 15 * 60 });
  } catch (error) {
    handleError(error, next, res);
  }
}

export async function resendRegistrationCodeController(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await resendRegistrationCode(stringField(req.body?.registrationId));
    res.status(200).json({ success: true, ...result, expiresIn: 15 * 60 });
  } catch (error) {
    handleError(error, next, res);
  }
}

export async function verifyRegistrationCodeController(req: Request, res: Response, next: NextFunction) {
  try {
    await verifyRegistrationCode(stringField(req.body?.registrationId), stringField(req.body?.code));
    res.status(200).json({ success: true });
  } catch (error) {
    handleError(error, next, res);
  }
}

export async function completeRegistrationController(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await completeRegistration(stringField(req.body?.registrationId), stringField(req.body?.password));
    res.status(200).json({ success: true, user });
  } catch (error) {
    handleError(error, next, res);
  }
}