export default () => ({
  port: process.env.PORT || 5000,
  database: {
    postgresUrl:
      process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/hms',
    mongo: process.env.MONGO_URI,
  },
  // kafka: {
  //   broker: process.env.KAFKA_BROKER || 'localhost:9095',
  // },
  // rabbitmq: {
  //   url: process.env.RABBITMQ_URL || 'amqp://localhost',
  // },
  jwt: {
    secret: process.env.JWT_SECRET || 'supersecret',
    expiresIn: '1d',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
});
