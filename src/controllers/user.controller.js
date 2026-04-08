import logger from '../config/logger.js';
import {
  getAllUser,
  getUserById as getUserByIdService,
  updateUser as updateUserService,
  deleteUser as deleteUserService,
} from '../services/user.service.js';
import {
  updateUserSchema,
  userIdSchema,
} from '../validations/users.validation.js';
import { formatValidationError } from '../utils/format.js';
import { jwttoken } from '../utils/jwt.js';
import { cookies } from '../utils/cookies.js';

export const getAllUsers = async (req, res, next) => {
  try {
    logger.info('Getting Users..');

    const allUsers = await getAllUser();

    res.json({
      message: 'Successfully retrieved users',
      users: allUsers,
      count: allUsers.length,
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

const getAuthUserFromRequest = req => {
  const cookieToken = cookies.get(req, 'token');
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;
  const token = cookieToken || bearerToken;

  if (!token) {
    throw new Error('Unauthorized');
  }

  return jwttoken.verify(token);
};

export const getUserById = async (req, res, next) => {
  try {
    logger.info('Getting user by id..');

    const idValidation = userIdSchema.safeParse(req.params);

    if (!idValidation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(idValidation.error),
      });
    }

    const foundUser = await getUserByIdService(idValidation.data.id);

    return res.status(200).json({
      message: 'Successfully retrieved user',
      user: foundUser,
    });
  } catch (error) {
    logger.error('Get user by id error', error);

    if (error.message === 'User not found') {
      return res.status(404).json({ error: error.message });
    }

    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    logger.info('Updating user..');

    const idValidation = userIdSchema.safeParse(req.params);
    if (!idValidation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(idValidation.error),
      });
    }

    const bodyValidation = updateUserSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(bodyValidation.error),
      });
    }

    let authUser;
    try {
      authUser = getAuthUserFromRequest(req);
    } catch (authError) {
      return res.status(401).json({ error: authError.message });
    }

    const targetUserId = idValidation.data.id;
    const updates = { ...bodyValidation.data };
    const isAdmin = authUser.role === 'admin';
    const isSelf = Number(authUser.id) === Number(targetUserId);

    if (!isAdmin && !isSelf) {
      return res
        .status(403)
        .json({ error: 'Forbidden: you can only update your own account' });
    }

    if (!isAdmin && Object.prototype.hasOwnProperty.call(updates, 'role')) {
      return res
        .status(403)
        .json({ error: 'Forbidden: only admin can update role' });
    }

    const updatedUser = await updateUserService(targetUserId, updates);

    return res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    logger.error('Update user error', error);

    if (error.message === 'User not found') {
      return res.status(404).json({ error: error.message });
    }

    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    logger.info('Deleting user..');

    const idValidation = userIdSchema.safeParse(req.params);
    if (!idValidation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(idValidation.error),
      });
    }

    let authUser;
    try {
      authUser = getAuthUserFromRequest(req);
    } catch (authError) {
      return res.status(401).json({ error: authError.message });
    }

    const targetUserId = idValidation.data.id;
    const isAdmin = authUser.role === 'admin';
    const isSelf = Number(authUser.id) === Number(targetUserId);

    if (!isAdmin && !isSelf) {
      return res
        .status(403)
        .json({ error: 'Forbidden: you can only delete your own account' });
    }

    const deletedUser = await deleteUserService(targetUserId);

    return res.status(200).json({
      message: 'User deleted successfully',
      user: deletedUser,
    });
  } catch (error) {
    logger.error('Delete user error', error);

    if (error.message === 'User not found') {
      return res.status(404).json({ error: error.message });
    }

    next(error);
  }
};
