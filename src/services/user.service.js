import { db } from '../config/db.js';
import logger from '../config/logger.js';
import { user } from '../models/user.model.js';
import { eq } from 'drizzle-orm';

export const getAllUser = async () => {
  try {
    const allUser = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at,
      })
      .from(user);

    return allUser;
  } catch (error) {
    logger.error('Error getting User', error);
    throw error;
  }
};

export const getUserById = async id => {
  try {
    const [existingUser] = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at,
      })
      .from(user)
      .where(eq(user.id, id))
      .limit(1);

    if (!existingUser) {
      throw new Error('User not found');
    }

    return existingUser;
  } catch (error) {
    logger.error('Error getting user by id', error);
    throw error;
  }
};

export const updateUser = async (id, updates) => {
  try {
    const [existingUser] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.id, id))
      .limit(1);

    if (!existingUser) {
      throw new Error('User not found');
    }

    const [updatedUser] = await db
      .update(user)
      .set({ ...updates, updated_at: new Date() })
      .where(eq(user.id, id))
      .returning({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at,
      });

    return updatedUser;
  } catch (error) {
    logger.error('Error updating user', error);
    throw error;
  }
};

export const deleteUser = async id => {
  try {
    const [deletedUser] = await db
      .delete(user)
      .where(eq(user.id, id))
      .returning({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      });

    if (!deletedUser) {
      throw new Error('User not found');
    }

    return deletedUser;
  } catch (error) {
    logger.error('Error deleting user', error);
    throw error;
  }
};
