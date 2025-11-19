// Neon Database Connection (using standard pg driver)
import pg from 'pg';
import { config } from '../config/index.js';

const { Pool } = pg;

if (!config.database.url) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create optimized connection pool
const pool = new Pool({
  connectionString: config.database.url,
  ssl: { rejectUnauthorized: false },
  max: config.database.pool.max,
  idleTimeoutMillis: config.database.pool.idleTimeout,
  connectionTimeoutMillis: config.database.pool.connectionTimeout,
  keepAlive: true, // Enable TCP keepalive
  keepAliveInitialDelayMillis: 10000
});

// Error handler for pool
pool.on('error', (err) => {
  console.error('Unexpected database pool error', err);
});

// Helper functions for common queries
export async function query(text, params = []) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    if (duration > 1000) {
      console.warn(`Slow query (${duration}ms): ${text.substring(0, 100)}`);
    }
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export async function getUser(email) {
  const result = await query(
    'SELECT * FROM users WHERE email = $1 LIMIT 1',
    [email]
  );
  return result[0];
}

export async function createUser(email, name, passwordHash) {
  const result = await query(
    `INSERT INTO users (email, name, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, email, name, created_at, images_processed, tools_used, has_discount, plan`,
    [email, name, passwordHash]
  );
  return result[0];
}

export async function getUserByProvider(provider, providerId) {
  const result = await query(
    'SELECT * FROM users WHERE auth_provider = $1 AND provider_id = $2 LIMIT 1',
    [provider, providerId]
  );
  return result[0];
}

export async function createOAuthUser({ email, name, provider, providerId, providerEmail, avatarUrl }) {
  const result = await query(
    `INSERT INTO users (email, name, auth_provider, provider_id, provider_email, avatar_url, password_hash)
     VALUES ($1, $2, $3, $4, $5, $6, NULL)
     RETURNING id, email, name, created_at, images_processed, tools_used, has_discount, plan, auth_provider, avatar_url`,
    [email, name, provider, providerId, providerEmail || email, avatarUrl]
  );
  return result[0];
}

export async function updateUserProvider(userId, { provider, providerId, providerEmail, avatarUrl }) {
  const result = await query(
    `UPDATE users
     SET auth_provider = $2,
         provider_id = $3,
         provider_email = $4,
         avatar_url = COALESCE($5, avatar_url),
         updated_at = NOW()
     WHERE id = $1
     RETURNING id, email, name, created_at, images_processed, tools_used, has_discount, plan, auth_provider, avatar_url`,
    [userId, provider, providerId, providerEmail, avatarUrl]
  );
  return result[0];
}

export async function createSession(userId, sessionToken, expiresAt) {
  const result = await query(
    `INSERT INTO user_sessions (user_id, session_token, expires_at)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [userId, sessionToken, expiresAt]
  );
  return result[0];
}

export async function getSession(sessionToken) {
  const result = await query(
    `SELECT s.*, u.email, u.name, u.images_processed, u.tools_used, u.has_discount, u.plan
     FROM user_sessions s
     JOIN users u ON s.user_id = u.id
     WHERE s.session_token = $1
     AND s.expires_at > NOW()
     LIMIT 1`,
    [sessionToken]
  );
  return result[0];
}

export async function deleteSession(sessionToken) {
  await query('DELETE FROM user_sessions WHERE session_token = $1', [sessionToken]);
}

export async function updateUserStats(userId, imagesProcessed, toolsUsed) {
  const result = await query(
    `UPDATE users
     SET images_processed = $2,
         tools_used = $3,
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [userId, imagesProcessed, JSON.stringify(toolsUsed)]
  );
  return result[0];
}

export async function addUserHistory(userId, toolName, thumbnail, metadata) {
  const result = await query(
    `INSERT INTO user_history (user_id, tool_name, thumbnail, metadata)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [userId, toolName, thumbnail, JSON.stringify(metadata)]
  );
  return result[0];
}

export async function getUserHistory(userId, limit = 20) {
  const result = await query(
    `SELECT * FROM user_history
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  return result;
}

// Stripe-related functions
export async function updateUserStripeCustomer(userId, stripeCustomerId) {
  const result = await query(
    `UPDATE users
     SET stripe_customer_id = $2,
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [userId, stripeCustomerId]
  );
  return result[0];
}

export async function updateUserSubscription(userId, subscriptionId, status, expiresAt) {
  const result = await query(
    `UPDATE users
     SET stripe_subscription_id = $2,
         stripe_subscription_status = $3,
         subscription_expires_at = $4,
         plan = CASE WHEN $3 = 'active' THEN 'pro' ELSE 'free' END,
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [userId, subscriptionId, status, expiresAt]
  );
  return result[0];
}

export async function getUserByStripeCustomerId(stripeCustomerId) {
  const result = await query(
    'SELECT * FROM users WHERE stripe_customer_id = $1 LIMIT 1',
    [stripeCustomerId]
  );
  return result[0];
}
