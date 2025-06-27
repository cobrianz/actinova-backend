import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Use Map instead of Set for token blacklist with expiration tracking
const tokenBlacklist = new Map();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

// Cleanup expired tokens from blacklist
function cleanupBlacklist() {
  const now = Date.now();
  for (const [token, expiresAt] of tokenBlacklist) {
    if (expiresAt < now) {
      tokenBlacklist.delete(token);
    }
  }
}

// Run cleanup every hour
setInterval(cleanupBlacklist, 60 * 60 * 1000);

export function signToken(payload, options = { expiresIn: "7d" }) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid payload: Payload must be a non-empty object");
  }
  try {
    return jwt.sign(payload, JWT_SECRET, {
      ...options,
      algorithm: "HS256",
    });
  } catch (err) {
    throw new Error(`Failed to sign token: ${err.message}`);
  }
}

export async function verifyToken(token) {
  if (!token || typeof token !== "string") {
    throw new Error("Invalid token: Token must be a non-empty string");
  }
  if (tokenBlacklist.has(token)) {
    throw new Error("Token has been invalidated");
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new Error("Token has expired");
    }
    throw new Error(`Invalid token: ${err.message}`);
  }
}

export async function hashPassword(password) {
  if (!password || typeof password !== "string" || password.length < 6) {
    throw new Error(
      "Invalid password: Password must be a non-empty string with at least 6 characters"
    );
  }
  try {
    return await bcrypt.hash(password, 12);
  } catch (err) {
    throw new Error(`Failed to hash password: ${err.message}`);
  }
}

export async function verifyPassword(plain, hash) {
  if (
    !plain ||
    !hash ||
    typeof plain !== "string" ||
    typeof hash !== "string"
  ) {
    throw new Error(
      "Invalid input: Both plain password and hash must be non-empty strings"
    );
  }
  try {
    return await bcrypt.compare(plain, hash);
  } catch (err) {
    throw new Error(`Failed to verify password: ${err.message}`);
  }
}

export async function invalidateToken(
  token,
  expiresIn = 7 * 24 * 60 * 60 * 1000
) {
  if (!token || typeof token !== "string") {
    throw new Error("Invalid token: Token must be a non-empty string");
  }
  const expiresAt = Date.now() + expiresIn;
  tokenBlacklist.set(token, expiresAt);
}
