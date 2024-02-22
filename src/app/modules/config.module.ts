import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

export const configModule = ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: `.${process.env.NODE_ENV}.env`,
  validationSchema: Joi.object({
    NODE_ENV: Joi.string().valid('dev', 'prod', 'local'),
    CRAWLER_API_ROOT: Joi.string().required(),
    PORTAL_AUTH_URL: Joi.string().required(),
    JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
    JWT_ACCESS_TOKEN_EXPIRE_TIME: Joi.string().required(),
    JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
    JWT_REFRESH_TOKEN_EXPIRE_TIME: Joi.string().required(),
    PASSWORD_SALT: Joi.string().required(),
    PASSWORD_ENCRYPT_KEY: Joi.string().required(),
    FIREBASE_PROJECT_ID: Joi.string().required(),
    FIREBASE_CLIENT_EMAIL: Joi.string().required(),
    FIREBASE_PRIVATE_KEY: Joi.string().required(),
  }),
});
