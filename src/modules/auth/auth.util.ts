import * as bcrypt from 'bcryptjs';
import { BCRYPT_SALT_ROUND } from 'src/config';

export const comparePassword = async (
  actualPasswordHash: string,
  passwordToCheck: string,
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(passwordToCheck, actualPasswordHash, (error, isMatch) => {
      if (!error && isMatch) {
        return resolve(true);
      }
      return resolve(false);
    });
  });
};

export const createPasswordHash = async (password: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, BCRYPT_SALT_ROUND, (error, hash) => {
      if (!error && hash) {
        return resolve(hash);
      }
      return reject(null);
    });
  });
};
