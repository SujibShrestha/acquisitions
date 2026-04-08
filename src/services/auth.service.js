import bcrypt from 'bcrypt';
import logger from '../config/logger.js';
import { db } from '../config/db.js';
import { user as users } from '../models/user.model.js';
import { eq } from 'drizzle-orm';

export const hashPassword = async password => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    logger.error('Hashing password Error', error);
    throw new Error('Error Hashing', { cause: error });
  }
};

export const createUser = async ({ name, email, password, role = 'user' }) => {
  try {
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new Error('User with this email already exists');
    }

    const password_hash = await hashPassword(password);
    const [newUser] = await db
      .insert(users)
      .values({ name, email, password: password_hash, role })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.created_at,
      });

    logger.info(`user with ${newUser.email} created Successfully`);

    return newUser;
  } catch (error) {
    if (
      (error?.cause?.code === '23505' || error?.code === '23505') &&
      error?.cause?.constraint === 'users_email_unique'
    ) {
      throw new Error('User with this email already exists', { cause: error });
    }

    logger.error('Error creating user', error);
    throw error;
  }
};
