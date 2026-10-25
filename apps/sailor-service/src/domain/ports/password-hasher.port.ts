export const I_PASSWORD_HASHER = Symbol('IPasswordHasher');

export interface IPasswordHasher {
  hash(plain: string): Promise<string>;
  matches(plain: string, passwordHash: string): Promise<boolean>;
}
