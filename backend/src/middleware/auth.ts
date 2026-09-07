import type { NextFunction, Request, Response } from 'express';

import { getFirebaseAdminAuth } from '../config/firebase.js';

export async function requireFirebaseAuth(req: Request, res: Response, next: NextFunction) {
  const authorization = req.header('Authorization');

  if (!authorization?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Bearer token is required' });
    return;
  }

  const idToken = authorization.slice('Bearer '.length).trim();

  if (!idToken) {
    res.status(401).json({ success: false, error: 'Bearer token is required' });
    return;
  }

  try {
    const decodedToken = await getFirebaseAdminAuth().verifyIdToken(idToken);

    req.user = {
      firebaseUid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      phoneNumber: decodedToken.phone_number,
      emailVerified: decodedToken.email_verified ?? false,
    };

    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired Firebase ID token' });
  }
}