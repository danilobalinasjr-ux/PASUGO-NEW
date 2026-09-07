import type { NextFunction, Request, Response } from 'express';
import type { RowDataPacket } from 'mysql2';

import { pool } from '../config/database.js';

type UserRow = RowDataPacket & {
  id: number;
  firebase_uid: string;
  email: string | null;
  phone: string | null;
  full_name: string;
  status: 'active' | 'suspended' | 'deleted';
};

type RoleRow = RowDataPacket & {
  role: 'customer' | 'rider' | 'administrator';
};

export async function verifyAuthentication(req: Request, res: Response, next: NextFunction) {
  const authenticatedUser = req.user;

  if (!authenticatedUser) {
    res.status(401).json({ success: false, error: 'Authentication is required' });
    return;
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [existingUsers] = await connection.execute<UserRow[]>(
      'SELECT id, firebase_uid, email, phone, full_name, status FROM users WHERE firebase_uid = ? LIMIT 1',
      [authenticatedUser.firebaseUid],
    );

    if (existingUsers.length === 0) {
      const fullName = authenticatedUser.name ?? authenticatedUser.email ?? 'PASUGO User';

      await connection.execute(
        'INSERT INTO users (firebase_uid, email, phone, full_name) VALUES (?, ?, ?, ?)',
        [authenticatedUser.firebaseUid, authenticatedUser.email ?? null, authenticatedUser.phoneNumber ?? null, fullName],
      );
    }

    const [users] = await connection.execute<UserRow[]>(
      'SELECT id, firebase_uid, email, phone, full_name, status FROM users WHERE firebase_uid = ? LIMIT 1',
      [authenticatedUser.firebaseUid],
    );
    const user = users[0];

    if (!user) {
      throw new Error('Authenticated user could not be loaded');
    }

    const [roleRows] = await connection.execute<RoleRow[]>(
      'SELECT role FROM user_roles WHERE user_id = ? ORDER BY role',
      [user.id],
    );

    await connection.commit();

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        firebaseUid: user.firebase_uid,
        email: user.email,
        phone: user.phone,
        fullName: user.full_name,
        status: user.status,
        roles: roleRows.map(({ role }) => role),
      },
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}