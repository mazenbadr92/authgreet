import { CONFIG_KEYS, JWT_CONSTANTS } from './constants';

export default () => ({
  nodeEnv: process.env[CONFIG_KEYS.NODE_ENV],
  port: process.env[CONFIG_KEYS.PORT] || 3000,
  jwt: {
    secret: process.env[CONFIG_KEYS.ACCESS_JWT_SECRET],
    expiresIn:
      process.env[CONFIG_KEYS.ACCESS_JWT_EXPIRES_IN] ||
      JWT_CONSTANTS.FIVE_MINUTES,
  },
  refreshJwt: {
    secret: process.env[CONFIG_KEYS.REFRESH_JWT_SECRET],
    expiresIn:
      process.env[CONFIG_KEYS.REFRESH_JWT_EXPIRES_IN] ||
      JWT_CONSTANTS.ONE_MONTH,
  },
  bcrypt: {
    pepper: process.env[CONFIG_KEYS.BCRYPT_PEPPER],
    saltRounds: process.env[CONFIG_KEYS.BCRYPT_SALT_ROUNDS]
      ? parseInt(process.env[CONFIG_KEYS.BCRYPT_SALT_ROUNDS]!, 10)
      : 10,
  },
  mongo: {
    uri: process.env[CONFIG_KEYS.MONGO_URI],
  },
});
