import mongoose from 'mongoose';

let isConnected = false;

/**
 * Connects to MongoDB if MONGODB_URI is provided.
 * Gracefully falls back to in-memory persistence if MongoDB is unavailable or fails to connect.
 */
export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.log('[Database] MONGODB_URI not configured. Operating in in-memory persistence mode.');
    isConnected = false;
    return false;
  }

function sanitizeLog(msg = '') {
  return String(msg).replace(/\/\/([^:]+):([^@]+)@/g, '//$1:****@');
}

  try {
    // 2-second timeout so server startup never blocks on unavailable local Mongo
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });

    isConnected = true;
    console.log('[Database] Successfully connected to MongoDB.');
    return true;
  } catch (err) {
    console.warn(`[Database] MongoDB connection failed: ${sanitizeLog(err.message)}. Operating in in-memory persistence mode.`);
    isConnected = false;
    return false;
  }
}

/**
 * Disconnects from MongoDB if currently connected.
 */
export async function disconnectDatabase() {
  if (isConnected || mongoose.connection.readyState !== 0) {
    try {
      await mongoose.disconnect();
    } catch (err) {
      console.warn(`[Database] Error during disconnect: ${err.message}`);
    } finally {
      isConnected = false;
    }
  }
}

/**
 * Returns true if MongoDB connection is open and active.
 */
export function isDatabaseConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}
