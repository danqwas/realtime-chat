import 'dotenv/config';

import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  DB_HOST: string;
  DB_PORT: number;
  DB_PASSWORD: string;
  POSTGRES_DB: string;
  POSTGRES_USER: string;
  JWT_SECRET: string;
}

const envSchema = joi
  .object<EnvVars>({
    PORT: joi.number().port().required(),
    DB_HOST: joi.string().required(),
    DB_PORT: joi.number().port().required(),
    DB_PASSWORD: joi.string().required(),
    POSTGRES_DB: joi.string().required(),
    POSTGRES_USER: joi.string().required(),
    JWT_SECRET: joi.string().required(),
  })
  .unknown(true);

const { error, value } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}
const envVars: EnvVars = value;
export const envs = {
  port: envVars.PORT,
  host: envVars.DB_HOST,
  dbPort: envVars.DB_PORT,
  dbPassword: envVars.DB_PASSWORD,
  postgresDb: envVars.POSTGRES_DB,
  postgresUser: envVars.POSTGRES_USER,
  jwtSecret: envVars.JWT_SECRET,
};
