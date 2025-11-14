import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis;
  private subscriberClient: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor() {
    this.redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
      retryStrategy: (times) => Math.min(times * 100, 5000), // Better auto-reconnect strategy
    });

    this.subscriberClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
      retryStrategy: (times) => Math.min(times * 100, 5000),
    });

    this.redisClient.on('error', (err) => this.logger.error(`❌ Redis Error: ${err.message}`));
    this.subscriberClient.on('error', (err) => this.logger.error(`❌ Redis Subscriber Error: ${err.message}`));

    this.logger.log('✅ Redis Connected Successfully');
  }

  async onModuleInit() {
    this.logger.log('🔄 Initializing Redis Pub/Sub subscriptions...');
  }

  async onModuleDestroy() {
    await this.redisClient.quit();
    await this.subscriberClient.quit();
    this.logger.log('🚪 Redis connections closed');
  }

  /**
   * 📝 Save chat messages in Redis (For real-time performance)
   */
  async saveChatToRedis(sessionId: string, message: any): Promise<void> {
    try {
      const key = `chat:${sessionId}`;
      const messageData = JSON.stringify({ ...message, timestamp: Date.now() });

      await this.redisClient.rpush(key, messageData); // Push message to chat list
      await this.redisClient.expire(key, 3600); // Set expiry (1 hour)
      
      this.logger.log(`✅ Chat message stored in Redis [Session: ${sessionId}]`);
    } catch (error) {
      this.logger.error(`❌ Failed to store message in Redis: ${error.message}`);
    }
  }

  /**
   * 📩 Get chat history from Redis (For active chats)
   */
  async getChatHistory(sessionId: string): Promise<any[]> {
    try {
      const key = `chat:${sessionId}`;
      const messages = await this.redisClient.lrange(key, 0, -1);

      if (!messages.length) {
        this.logger.warn(`⚠️ No active chat found in Redis for Session: ${sessionId}`);
        return [];
      }

      return messages.map((msg) => JSON.parse(msg));
    } catch (error) {
      this.logger.error(`❌ Failed to fetch chat history: ${error.message}`);
      return [];
    }
  }

  /**
   * 📊 Get Active Chat Sessions (Sessions stored in Redis)
   */
  async getActiveChatSessions(): Promise<string[]> {
    try {
      const keys = await this.redisClient.keys('chat:*');
      return keys.map((key) => key.replace('chat:', ''));
    } catch (error) {
      this.logger.error(`❌ Failed to retrieve active sessions: ${error.message}`);
      return [];
    }
  }

/**
 * 📊 Get Appointment Keys
 */
async getAppointmentKeys(): Promise<string[]> {
  try {
    const keys = await this.redisClient.keys('appointment:*'); // Removed extra `)`
    return keys.map((key) => key.replace('appointment:', ''));
  } catch (error) {
    console.error(`❌ Failed to retrieve appointment keys: ${error.message}`);
    return [];
  }
}


  /**
   * 🔄 Set Cache with Optional Expiry
   */
  async set(key: string, value: any, ttlSeconds?: number) {
    const data = JSON.stringify(value);
    if (ttlSeconds) {
      await this.redisClient.set(key, data, 'EX', ttlSeconds);
    } else {
      await this.redisClient.set(key, data);
    }
  }

  /**
   * 🔍 Get Cached Value
   */
  async get<T>(key: string): Promise<T | null> {
    const data = await this.redisClient.get(key);
    return data ? JSON.parse(data) : null;
  }

  /**
   * ❌ Delete Cache
   */
  async del(key: string) {
    await this.redisClient.del(key);
  }

  /**
   * 🔄 Delete Multiple Keys by Pattern
   */
  async delPattern(pattern: string): Promise<void> {
    const keys = await this.redisClient.keys(pattern);
    if (keys.length > 0) {
      await this.redisClient.del(keys);
      this.logger.log(`✅ Deleted ${keys.length} keys with pattern: ${pattern}`);
    }
  }

  /**
   * 📡 Pub/Sub Subscribe to a Channel
   */
  async subscribe(channel: string, callback: (message: string) => void) {
    try {
      await this.subscriberClient.subscribe(channel);
      this.subscriberClient.on('message', (ch, message) => {
        if (ch === channel) {
          callback(message);
        }
      });
      this.logger.log(`📡 Subscribed to Redis channel: ${channel}`);
    } catch (error) {
      this.logger.error(`❌ Failed to subscribe to Redis channel: ${error.message}`);
    }
  }

  /**
   * 📢 Publish Message to Redis Channel
   */
  async publish(channel: string, message: string) {
    try {
      await this.redisClient.publish(channel, message);
      this.logger.log(`📢 Published message to ${channel}`);
    } catch (error) {
      this.logger.error(`❌ Failed to publish message: ${error.message}`);
    }
  }
}
