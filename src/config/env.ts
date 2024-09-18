import * as Yup from 'yup';

import { config } from 'dotenv';

config();
export default () => {
  const envVarsSchema = Yup.object()
    .shape({
      PORT: Yup.string().default('3210'),
      APP_NAME: Yup.string().default('API Gateway').required(),
      MONGO_DB_URI: Yup.string().required(),
      NODE_ENV: Yup.string().oneOf(['development', 'production', 'test', 'staging']).default('development'),
      SERVICE_NAME: Yup.string().required().default('blink-caesar'),
      REDIS_URL: Yup.string().required(),
      SERVICE_SECRET: Yup.string().required(),
    })
    .unknown();
  let envVars: Yup.InferType<typeof envVarsSchema>;
  try {
    envVars = envVarsSchema.validateSync(process.env, {
      strict: true,
      abortEarly: true,
      stripUnknown: true,
    });
  } catch (error) {
    throw new Error(`Config validation error: ${error.message}`);
  }

  return {
    port: envVars.PORT,
    env: envVars.NODE_ENV,
    is_production: envVars.NODE_ENV === 'production',
    app_name: envVars.APP_NAME,
    service_name: envVars.SERVICE_NAME,
    service_secret: envVars.SERVICE_SECRET,
    service_secret_bytes: Buffer.from(envVars.SERVICE_SECRET),
    database: {
      mongo_uri: envVars.MONGO_DB_URI,
    },
    redis: {
      url: envVars.REDIS_URL,
    },
  };
};
