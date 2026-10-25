import { Name } from '@marinheiros/core';
import { Sailor } from '../../../src/domain/entities/sailor.entity';
import { ResetForgottenPasswordInput } from '../../../src/domain/interfaces';
import { ResetForgottenPasswordService } from '../../../src/domain/services/reset-forgotten-password.service';

const EMPTY_PASSWORD = 'Informe a senha nova.';
const CONFIRMATION_MISMATCH = 'A confirmação da senha não confere.';
const EMAIL_NOT_FOUND = 'Não encontramos uma conta com esse e-mail.';
const IDENTITY_MISMATCH = 'Os dados não conferem com esta conta.';
const SAME_PASSWORD = 'A senha nova precisa ser diferente da senha atual.';

const STORED_EMAIL = 'teste@marinheiros.local';
const OLD_HASH = 'hash-antigo';
const NEW_HASH = 'hash-novo';

function account(): Sailor {
  return new Sailor('sailor-1', new Name('Lais', 'Teste'), 'Praticante', STORED_EMAIL, OLD_HASH);
}

function input(overrides: Partial<ResetForgottenPasswordInput> = {}): ResetForgottenPasswordInput {
  return {
    email: STORED_EMAIL,
    firstName: 'Lais',
    lastName: 'Teste',
    newPassword: 'Nova123',
    confirmPassword: 'Nova123',
    ...overrides,
  };
}

describe('ResetForgottenPasswordService', () => {
  const sailors = {
    findByNormalizedEmail: jest.fn<Promise<Sailor | null>, [string]>(),
    update: jest.fn<Promise<void>, [Sailor]>(),
  };
  const passwords = {
    matches: jest.fn<Promise<boolean>, [string, string]>(),
    hash: jest.fn<Promise<string>, [string]>(),
  };
  const service = new ResetForgottenPasswordService(sailors, passwords);

  beforeEach(() => {
    jest.clearAllMocks();
    sailors.findByNormalizedEmail.mockResolvedValue(account());
    passwords.matches.mockResolvedValue(false);
    passwords.hash.mockResolvedValue(NEW_HASH);
  });

  it('rejects a blank new password before looking up the account', async () => {
    await expect(service.reset(input({ newPassword: '   ', confirmPassword: 'outra' }))).rejects.toThrow(EMPTY_PASSWORD);

    expect(sailors.findByNormalizedEmail).not.toHaveBeenCalled();
    expect(sailors.update).not.toHaveBeenCalled();
  });

  it('rejects a confirmation that differs from the typed password', async () => {
    await expect(service.reset(input({ newPassword: 'Nova123', confirmPassword: 'Nova123 ' }))).rejects.toThrow(
      CONFIRMATION_MISMATCH,
    );

    expect(sailors.findByNormalizedEmail).not.toHaveBeenCalled();
    expect(sailors.update).not.toHaveBeenCalled();
  });

  it('rejects an unknown email after normalizing it', async () => {
    sailors.findByNormalizedEmail.mockResolvedValue(null);

    await expect(service.reset(input({ email: ' Teste@Marinheiros.Local ' }))).rejects.toThrow(EMAIL_NOT_FOUND);

    expect(sailors.findByNormalizedEmail).toHaveBeenCalledWith(STORED_EMAIL);
    expect(sailors.update).not.toHaveBeenCalled();
  });

  it('rejects a name or surname that does not match the account', async () => {
    await expect(service.reset(input({ firstName: 'Laís' }))).rejects.toThrow(IDENTITY_MISMATCH);
    await expect(service.reset(input({ lastName: 'Silva' }))).rejects.toThrow(IDENTITY_MISMATCH);

    expect(sailors.update).not.toHaveBeenCalled();
  });

  it('accepts a name that differs only by case and surrounding spaces', async () => {
    await service.reset(input({ firstName: ' lais ', lastName: ' TESTE ' }));

    expect(sailors.update).toHaveBeenCalledTimes(1);
    expect(sailors.update.mock.calls[0][0].passwordHash).toBe(NEW_HASH);
  });

  it('rejects a new password equal to the current one', async () => {
    passwords.matches.mockResolvedValue(true);

    await expect(service.reset(input())).rejects.toThrow(SAME_PASSWORD);

    expect(passwords.matches).toHaveBeenCalledWith('Nova123', OLD_HASH);
    expect(sailors.update).not.toHaveBeenCalled();
  });

  it('stores the new hash and drops the previous one', async () => {
    await service.reset(input());

    expect(passwords.matches).toHaveBeenCalledWith('Nova123', OLD_HASH);
    expect(passwords.hash).toHaveBeenCalledWith('Nova123');
    expect(sailors.update).toHaveBeenCalledTimes(1);

    const saved = sailors.update.mock.calls[0][0];
    expect(saved).toBeInstanceOf(Sailor);
    expect(saved.passwordHash).toBe(NEW_HASH);
    expect(saved.passwordHash).not.toBe(OLD_HASH);
    expect(saved.id).toBe('sailor-1');
    expect(saved.email).toBe(STORED_EMAIL);
  });
});
