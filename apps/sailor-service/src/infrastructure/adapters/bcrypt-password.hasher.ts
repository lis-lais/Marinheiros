import * as bcrypt from 'bcryptjs';
import { IPasswordHasher } from '../../domain/ports/password-hasher.port';

export class BcryptPasswordHasher implements IPasswordHasher {
  hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, 10);
  }

  matches(plain: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(plain, passwordHash);
  }
}
