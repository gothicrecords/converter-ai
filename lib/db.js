// Neon Database Connection (using standard pg driver)
import pg from 'pg';
const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Helper functions for common queries
export async function query(text, params = []) {
  try {
    const result = await pool.query(text, params);
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
