import { createHash, randomBytes, randomInt } from 'node:crypto';

import bcrypt from 'bcryptjs';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';

import { getFirebaseAdminAuth } from '../config/firebase.js';
import { env } from '../config/env.js';
import { pool } from '../config/database.js';
import { sendRegistrationCode } from './emailService.js';

type RegistrationRow = RowDataPacket & {
  id: number;
  registration_id_hash: string;
  email: string;
  full_name: string;
  password_hash: string;
  otp_hash: string;
  status: 'initiated' | 'otp_verified' | 'completing' | 'completed' | 'expired' | 'failed';
  attempt_count: number;
  resend_count: number;
  last_otp_sent_at: Date;
  resend_window_started_at: Date;
  expires_at: Date;
  firebase_uid: string | null;
  user_id: number | null;
};

export class RegistrationError extends Error {
  constructor(public readonly statusCode: number, message: string) {
    super(message);
  }
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashRegistrationId(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

function validateRegistrationInput(email: string, fullName: string, password: string) {
  if (!/^\S+@\S+\.\S+$/.test(email) || !fullName.trim() || password.length < 8) {
    throw new RegistrationError(400, 'Enter a valid email, name, and password of at least 8 characters.');
  }
}

async function findExistingFirebaseEmail(email: string) {
  try {
    await getFirebaseAdminAuth().getUserByEmail(email);
    return true;
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/user-not-found') {
      return false;
    }
    throw error;
  }
}

async function getRegistration(registrationId: string, forUpdate = false) {
  const [rows] = await pool.query<RegistrationRow[]>(
    `SELECT * FROM pending_registrations WHERE registration_id_hash = ? LIMIT 1${forUpdate ? ' FOR UPDATE' : ''}`,
    [hashRegistrationId(registrationId)],
  );
  return rows[0];
}

function enforceResendLimits(registration: RegistrationRow) {
  const now = Date.now();
  const lastSent = new Date(registration.last_otp_sent_at).getTime();
  const windowStart = new Date(registration.resend_window_started_at).getTime();

  if (now - lastSent < env.otp.resendCooldownSeconds * 1000) {
    throw new RegistrationError(429, 'Please wait before requesting another code.');
  }

  if (now - windowStart < 60 * 60 * 1000 && registration.resend_count >= env.otp.maxRequestsPerHour) {
    throw new RegistrationError(429, 'Too many verification code requests. Please try again later.');
  }
}

async function issueCode(registration: RegistrationRow, connection: import('mysql2/promise').PoolConnection) {
  enforceResendLimits(registration);
  const code = String(randomInt(100000, 999999));
  const otpHash = await bcrypt.hash(code, env.otp.bcryptSaltRounds);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + env.otp.expirationMinutes * 60 * 1000);
  const windowReset = now.getTime() - new Date(registration.resend_window_started_at).getTime() >= 60 * 60 * 1000;

  await connection.execute(
    `UPDATE pending_registrations
     SET otp_hash = ?, expires_at = ?, last_otp_sent_at = ?,
         resend_count = ?, resend_window_started_at = ?
     WHERE id = ?`,
    [
      otpHash,
      expiresAt,
      now,
      windowReset ? 1 : registration.resend_count + 1,
      windowReset ? now : registration.resend_window_started_at,
      registration.id,
    ],
  );

  await sendRegistrationCode(registration.email, registration.full_name, code);
  return { expiresAt };
}

export async function initiateRegistration(emailInput: string, fullName: string, password: string) {
  const email = normalizeEmail(emailInput);
  validateRegistrationInput(email, fullName, password);

  if (await findExistingFirebaseEmail(email)) {
    throw new RegistrationError(409, 'An account already exists for this email.');
  }

  const [users] = await pool.query<RowDataPacket[]>('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
  if (users.length > 0) {
    throw new RegistrationError(409, 'An account already exists for this email.');
  }

  const existing = await pool.query<RegistrationRow[]>('SELECT * FROM pending_registrations WHERE email = ? LIMIT 1', [email]);
  const existingRegistration = existing[0][0];
  if (existingRegistration && !['expired', 'failed', 'completed'].includes(existingRegistration.status)) {
    throw new RegistrationError(409, 'A verification is already in progress for this email.');
  }
  if (existingRegistration && existingRegistration.status !== 'completed') enforceResendLimits(existingRegistration);

  const registrationId = randomBytes(32).toString('hex');
  const passwordHash = await bcrypt.hash(password, env.otp.bcryptSaltRounds);
  const code = String(randomInt(100000, 999999));
  const otpHash = await bcrypt.hash(code, env.otp.bcryptSaltRounds);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + env.otp.expirationMinutes * 60 * 1000);
  const connection = await pool.getConnection();

  try {
    await connection.execute('DELETE FROM pending_registrations WHERE email = ?', [email]);
    await connection.execute(
      `INSERT INTO pending_registrations
       (registration_id_hash, email, full_name, password_hash, otp_hash, last_otp_sent_at, resend_window_started_at, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [hashRegistrationId(registrationId), email, fullName.trim(), passwordHash, otpHash, now, now, expiresAt],
    );
    await sendRegistrationCode(email, fullName.trim(), code);
  } catch (error) {
    await connection.execute('DELETE FROM pending_registrations WHERE registration_id_hash = ?', [hashRegistrationId(registrationId)]).catch(() => undefined);
    throw error;
  } finally {
    connection.release();
  }

  return { registrationId, email, expiresAt };
}

export async function resendRegistrationCode(registrationId: string) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.query<RegistrationRow[]>(
      'SELECT * FROM pending_registrations WHERE registration_id_hash = ? LIMIT 1 FOR UPDATE',
      [hashRegistrationId(registrationId)],
    );
    const registration = rows[0];
    if (!registration || registration.status !== 'initiated') throw new RegistrationError(400, 'Start registration again.');
    const result = await issueCode(registration, connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function verifyRegistrationCode(registrationId: string, code: string) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.query<RegistrationRow[]>(
      'SELECT * FROM pending_registrations WHERE registration_id_hash = ? LIMIT 1 FOR UPDATE',
      [hashRegistrationId(registrationId)],
    );
    const registration = rows[0];
    if (!registration || registration.status !== 'initiated') throw new RegistrationError(400, 'This verification is no longer valid.');
    if (new Date(registration.expires_at).getTime() <= Date.now()) {
      await connection.execute("UPDATE pending_registrations SET status = 'expired' WHERE id = ?", [registration.id]);
      throw new RegistrationError(400, 'This code has expired.');
    }
    if (!/^\d{6}$/.test(code) || registration.attempt_count >= env.otp.maxAttempts) {
      await connection.execute("UPDATE pending_registrations SET status = 'failed' WHERE id = ?", [registration.id]);
      throw new RegistrationError(429, 'Maximum verification attempts reached.');
    }

    const valid = await bcrypt.compare(code, registration.otp_hash);
    if (!valid) {
      const nextAttempts = registration.attempt_count + 1;
      await connection.execute(
        `UPDATE pending_registrations SET attempt_count = ?, status = ? WHERE id = ?`,
        [nextAttempts, nextAttempts >= env.otp.maxAttempts ? 'failed' : registration.status, registration.id],
      );
      throw new RegistrationError(nextAttempts >= env.otp.maxAttempts ? 429 : 400, nextAttempts >= env.otp.maxAttempts ? 'Maximum verification attempts reached.' : 'Invalid verification code.');
    }

    await connection.execute("UPDATE pending_registrations SET status = 'otp_verified', verified_at = CURRENT_TIMESTAMP WHERE id = ?", [registration.id]);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function completeRegistration(registrationId: string, password: string) {
  const connection = await pool.getConnection();
  let firebaseUid: string | undefined;
  let createdFirebaseUser = false;

  try {
    await connection.beginTransaction();
    const registration = await getRegistrationForConnection(connection, registrationId);
    if (!registration || !['otp_verified', 'completed'].includes(registration.status)) {
      throw new RegistrationError(400, 'Verify your email before completing registration.');
    }
    if (registration.status === 'completed' && registration.firebase_uid && registration.user_id) {
      await connection.commit();
      return loadAuthenticatedUser(connection, registration.user_id);
    }
    if (new Date(registration.expires_at).getTime() <= Date.now()) throw new RegistrationError(400, 'This registration has expired.');
    if (!(await bcrypt.compare(password, registration.password_hash))) throw new RegistrationError(400, 'Registration details are invalid.');

    await connection.execute("UPDATE pending_registrations SET status = 'completing', completing_at = CURRENT_TIMESTAMP WHERE id = ?", [registration.id]);
    const firebaseUser = await getFirebaseAdminAuth().createUser({ email: registration.email, password, displayName: registration.full_name });
    firebaseUid = firebaseUser.uid;
    createdFirebaseUser = true;

    const [userResult] = await connection.execute<ResultSetHeader>(
      'INSERT INTO users (firebase_uid, email, full_name, status) VALUES (?, ?, ?, \'active\')',
      [firebaseUid, registration.email, registration.full_name],
    );
    await connection.execute('INSERT INTO user_roles (user_id, role) VALUES (?, \'customer\')', [userResult.insertId]);
    await connection.execute('INSERT INTO customers (user_id) VALUES (?)', [userResult.insertId]);
    await connection.execute(
      "UPDATE pending_registrations SET status = 'completed', firebase_uid = ?, user_id = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?",
      [firebaseUid, userResult.insertId, registration.id],
    );
    await connection.commit();
    return loadAuthenticatedUser(connection, userResult.insertId);
  } catch (error) {
    await connection.rollback();
    if (createdFirebaseUser && firebaseUid) await getFirebaseAdminAuth().deleteUser(firebaseUid).catch(() => undefined);
    throw error;
  } finally {
    connection.release();
  }
}

async function getRegistrationForConnection(connection: import('mysql2/promise').PoolConnection, registrationId: string) {
  const [rows] = await connection.query<RegistrationRow[]>(
    'SELECT * FROM pending_registrations WHERE registration_id_hash = ? LIMIT 1 FOR UPDATE',
    [hashRegistrationId(registrationId)],
  );
  return rows[0];
}

async function loadAuthenticatedUser(connection: import('mysql2/promise').PoolConnection, userId: number) {
  const [rows] = await connection.query<RowDataPacket[]>('SELECT id, firebase_uid AS firebaseUid, email, phone, full_name AS fullName, status FROM users WHERE id = ? LIMIT 1', [userId]);
  const user = rows[0];
  const [roles] = await connection.query<RowDataPacket[]>('SELECT role FROM user_roles WHERE user_id = ? ORDER BY role', [userId]);
  return { ...user, roles: roles.map((row) => row.role) };
}