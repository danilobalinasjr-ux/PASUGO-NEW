import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';

import { env } from './env.js';

let firebaseAuth: Auth | undefined;

function getFirebaseCredentials() {
  const { projectId, clientEmail, privateKey } = env.firebase;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Firebase Admin configuration is incomplete. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.',
    );
  }

  return { projectId, clientEmail, privateKey };
}

export function getFirebaseAdminAuth(): Auth {
  if (!firebaseAuth) {
    const app = getApps()[0] ?? initializeApp({
      credential: cert(getFirebaseCredentials()),
    });

    firebaseAuth = getAuth(app);
  }

  return firebaseAuth;
}