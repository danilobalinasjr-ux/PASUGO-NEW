export type AuthenticatedUser = {
  id: number;
  firebaseUid: string;
  email: string | null;
  phone: string | null;
  fullName: string;
  status: 'active' | 'suspended' | 'deleted';
  roles: Array<'customer' | 'rider' | 'administrator'>;
};

type VerifyResponse = {
  success: boolean;
  user?: AuthenticatedUser;
  error?: string;
};

type RegistrationResponse = {
  success: boolean;
  registrationId?: string;
  email?: string;
  expiresAt?: string;
  expiresIn?: number;
  user?: AuthenticatedUser;
  error?: string;
};

// Development-only URL. Replace with the development computer's LAN IP for a physical Android device.
const DEVELOPMENT_API_BASE_URL = 'http://192.168.1.39:3000';

async function registrationRequest(path: string, body: Record<string, string>) {
  const response = await fetch(`${DEVELOPMENT_API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  let responseBody: RegistrationResponse;
  try {
    responseBody = (await response.json()) as RegistrationResponse;
  } catch {
    throw new Error('The backend returned an invalid response.');
  }

  if (!response.ok || !responseBody.success) {
    throw new Error(responseBody.error ?? 'Registration request failed.');
  }

  return responseBody;
}

export async function initiateRegistration(email: string, fullName: string, password: string) {
  const response = await registrationRequest('/api/auth/register/initiate', { email, fullName, password });
  if (!response.registrationId || !response.expiresAt) throw new Error('The backend returned an invalid registration response.');
  return { registrationId: response.registrationId, email: response.email ?? email, expiresAt: response.expiresAt };
}

export async function resendRegistrationCode(registrationId: string) {
  const response = await registrationRequest('/api/auth/register/resend', { registrationId });
  if (!response.expiresAt) throw new Error('The backend returned an invalid resend response.');
  return { expiresAt: response.expiresAt };
}

export async function verifyRegistrationOtp(registrationId: string, code: string) {
  await registrationRequest('/api/auth/register/verify-otp', { registrationId, code });
}

export async function completeRegistration(registrationId: string, password: string) {
  const response = await registrationRequest('/api/auth/register/complete', { registrationId, password });
  if (!response.user) throw new Error('The backend returned an invalid completion response.');
  return response.user;
}

export async function verifyFirebaseToken(idToken: string): Promise<AuthenticatedUser> {
  const response = await fetch(`${DEVELOPMENT_API_BASE_URL}/api/auth/verify`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
  });

  let responseBody: VerifyResponse;

  try {
    responseBody = (await response.json()) as VerifyResponse;
  } catch {
    throw new Error('The backend returned an invalid response.');
  }

  if (!response.ok || !responseBody.success || !responseBody.user) {
    throw new Error(responseBody.error ?? 'Backend authentication verification failed.');
  }

  return responseBody.user;
}
