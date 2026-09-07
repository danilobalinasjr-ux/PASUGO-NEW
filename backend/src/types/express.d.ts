export {};

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      firebaseUid: string;
      email?: string;
      name?: string;
      phoneNumber?: string;
      emailVerified: boolean;
      userId?: number;
      roles?: string[];
    };
  }
}
