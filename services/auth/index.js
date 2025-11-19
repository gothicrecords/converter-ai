/**
 * Authentication Service
 * Centralized authentication logic
 */

import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { getUser, createUser, createSession, deleteSession, getSession, getUserByProvider, createOAuthUser, updateUserProvider } from '../../lib/db';
import { ValidationError, ConflictError, AuthenticationError } from '../../errors';
import { validateEmail, validatePassword, validateName } from '../../validators';
import { config } from '../../config';

/**
 * Register a new user
 */
export async function registerUser({ name, email, password }) {
  // Validate input
  const validatedName = validateName(name);
  const validatedEmail = validateEmail(email);
  const validatedPassword = validatePassword(password, 6);

  // Check if user already exists
  const existingUser = await getUser(validatedEmail);
  if (existingUser) {
    throw new ConflictError('Email already registered');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(validatedPassword, config.security.bcryptRounds);

  // Create user
  const newUser = await createUser(validatedEmail, validatedName, passwordHash);

  // Create session
  const { sessionToken, expiresAt } = await createUserSession(newUser.id);

  return {
    user: sanitizeUser(newUser),
    sessionToken,
    expiresAt,
  };
}

/**
 * Authenticate user
 */
export async function authenticateUser({ email, password }) {
  // Validate input
  const validatedEmail = validateEmail(email);
  
  if (!password) {
    throw new ValidationError('Password is required');
  }

  // Find user
  const user = await getUser(validatedEmail);
  if (!user) {
    throw new AuthenticationError('Invalid email or password');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw new AuthenticationError('Invalid email or password');
  }

  // Create session
  const { sessionToken, expiresAt } = await createUserSession(user.id);

  return {
    user: sanitizeUser(user),
    sessionToken,
    expiresAt,
  };
}

/**
 * Create a session for a user
 */
export async function createUserSession(userId) {
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + config.session.maxAge);

  await createSession(userId, sessionToken, expiresAt);

  return { sessionToken, expiresAt };
}

/**
 * Logout user (delete session)
 */
export async function logoutUser(sessionToken) {
  if (sessionToken) {
    await deleteSession(sessionToken);
  }
}

/**
 * Get user from session
 */
export async function getUserFromSession(sessionToken) {
  if (!sessionToken) {
    return null;
  }

  const session = await getSession(sessionToken);
  if (!session) {
    return null;
  }

  return {
    id: session.user_id,
    email: session.email,
    name: session.name,
    images_processed: session.images_processed,
    tools_used: session.tools_used,
    has_discount: session.has_discount,
    plan: session.plan,
  };
}

/**
 * Register or login OAuth user
 * If user exists with same email, link OAuth account
 * If user exists with same provider+providerId, login
 * Otherwise, create new user
 */
export async function registerOrLoginOAuthUser({ provider, providerId, email, name, avatarUrl }) {
  // Validate input
  const validatedEmail = validateEmail(email);
  const validatedName = validateName(name || email.split('@')[0]);

  // Check if user exists with this provider+providerId
  const existingOAuthUser = await getUserByProvider(provider, providerId);
  if (existingOAuthUser) {
    // User already exists with this OAuth account, create session
    const { sessionToken, expiresAt } = await createUserSession(existingOAuthUser.id);
    return {
      user: sanitizeUser(existingOAuthUser),
      sessionToken,
      expiresAt,
    };
  }

  // Check if user exists with same email
  const existingEmailUser = await getUser(validatedEmail);
  if (existingEmailUser) {
    // Link OAuth account to existing user
    const updatedUser = await updateUserProvider(existingEmailUser.id, {
      provider,
      providerId,
      providerEmail: validatedEmail,
      avatarUrl,
    });
    
    const { sessionToken, expiresAt } = await createUserSession(updatedUser.id);
    return {
      user: sanitizeUser(updatedUser),
      sessionToken,
      expiresAt,
    };
  }

  // Create new OAuth user
  const newUser = await createOAuthUser({
    email: validatedEmail,
    name: validatedName,
    provider,
    providerId,
    providerEmail: validatedEmail,
    avatarUrl,
  });

  // Create session
  const { sessionToken, expiresAt } = await createUserSession(newUser.id);

  return {
    user: sanitizeUser(newUser),
    sessionToken,
    expiresAt,
  };
}

/**
 * Sanitize user object (remove sensitive data)
 */
function sanitizeUser(user) {
  const { password_hash, ...sanitized } = user;
  return sanitized;
}

