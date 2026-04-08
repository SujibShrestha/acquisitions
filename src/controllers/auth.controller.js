import logger from '../config/logger.js';
import { signupSchema } from '../validations/auth.validation.js';
import { formatValidationError } from '../utils/format.js';
import { createUser } from '../services/auth.service.js';
import { cookies } from '../utils/cookies.js';
import { jwttoken } from '../utils/jwt.js';

export const signUp = async (req, res, next) => {
  try {
    const validation = signupSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(validation.error),
      });
    }

    const { name, email, password, role } = validation.data;

    const user = await createUser({ name, email, password, role });

    const token = jwttoken.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    cookies.set(res, 'token', token);

    logger.info('User registered Successfully:', email);
    res.status(201).json({
      message: 'User registered',
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    logger.error('Signup  Error', error);

    if (error.message === 'User with this email already exists') {
      return res.status(409).json({ error: 'Email already exists' });
    }

    next(error);
  }
};
