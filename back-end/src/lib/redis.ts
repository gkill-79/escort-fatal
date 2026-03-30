import Redis from 'ioredis';

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  // BullMQ requires maxRetriesPerRequest to be null
  maxRetriesPerRequest: null,
  // Add password if defined in .env
  ...(process.env.REDIS_PASSWORD && { password: process.env.REDIS_PASSWORD }),
};

/**
 * Shared Redis instance for high-performance operations:
 * - Real-time heartbeat (Sorted Sets)
 * - Session management
 * - Fast counters
 */
export const redis = new Redis(redisConfig);

redis.on('connect', () => {
  console.log('✅ Connected to Redis successfully');
});

redis.on('error', (err) => {
  console.error('❌ Redis Connection Error:', err);
});

export default redis;
