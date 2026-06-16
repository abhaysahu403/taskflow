const redis = require('redis');

let client = null;

const connectRedis = async () => {
  try {
    client = redis.createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        reconnectStrategy: (retries) => {
          if (retries > 5) return new Error('Redis max retries reached');
          return retries * 1000;
        },
      },
      password: process.env.REDIS_PASSWORD || undefined,
    });

    client.on('error', (err) => {
      console.warn('⚠️  Redis error (non-fatal):', err.message);
    });

    await client.connect();
    console.log('✅ Redis connected successfully');
    return client;
  } catch (err) {
    console.warn('⚠️  Redis not available, running without cache');
    client = null;
  }
};

const getCache = async (key) => {
  if (!client) return null;
  try {
    const val = await client.get(key);
    return val ? JSON.parse(val) : null;
  } catch { return null; }
};

const setCache = async (key, value, ttlSeconds = 300) => {
  if (!client) return;
  try {
    await client.setEx(key, ttlSeconds, JSON.stringify(value));
  } catch {}
};

const delCache = async (key) => {
  if (!client) return;
  try { await client.del(key); } catch {}
};

module.exports = { connectRedis, getCache, setCache, delCache };
