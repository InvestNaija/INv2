declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      NODE_ENV: string;
      pass: string;
      DB_PG_HOST: string;
      DB_PG_DB_NAME: string;
      DB_PG_USERNAME: string;
      DB_PG_PASSWORD: string;
      DB_PG_PORT: string;
      DB_PG_TIMEZONE: string;
      AES_SECRET_KEY: string;
      ACCESS_TOKEN_SECRET: string;
      ACCESS_TOKEN_TIME: string;
      RABBITMQ: string;
      REDIS_SERVER: string;
      MAIL_ZEPTO_KEY: string;
      BACKEND_BASE: string;
    }
  }
}

export {};
