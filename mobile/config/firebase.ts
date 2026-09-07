import { getApp, getApps, initializeApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import type { Auth } from 'firebase/auth';

type FirebaseClientConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
};

const requiredConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const missingConfig = Object.entries(requiredConfig)
  .filter(([key, value]) => key !== 'measurementId' && !value)
  .map(([key]) => key);

if (missingConfig.length > 0) {
  throw new Error(
    `Missing Firebase client configuration: ${missingConfig.join(', ')}. ` +
      'Set the corresponding EXPO_PUBLIC_FIREBASE_* environment variables.',
  );
}

const firebaseConfig: FirebaseClientConfig = {
  apiKey: requiredConfig.apiKey as string,
  authDomain: requiredConfig.authDomain as string,
  projectId: requiredConfig.projectId as string,
  storageBucket: requiredConfig.storageBucket as string,
  messagingSenderId: requiredConfig.messagingSenderId as string,
  appId: requiredConfig.appId as string,
  ...(requiredConfig.measurementId
    ? { measurementId: requiredConfig.measurementId }
    : {}),
};

export const firebaseApp: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth: Auth = getAuth(firebaseApp);
