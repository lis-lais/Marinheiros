import { SailorController } from '../../../src/infrastructure/controllers/sailor.controller';

const MESSAGE = 'Senha alterada. Entre com a senha nova.';

function body() {
  return {
    email: 'teste@marinheiros.local',
    firstName: 'Lais',
    lastName: 'Teste',
    newPassword: 'Nova123',
    confirmPassword: 'Nova123',
  };
}

describe('SailorController password reset', () => {
  it('returns the success message and leaves the hash and token out', async () => {
    const resetForgottenPassword = { execute: jest.fn().mockResolvedValue({ message: MESSAGE }) };
    const controller = new SailorController(
      { execute: jest.fn() } as never,
      { execute: jest.fn() } as never,
      { execute: jest.fn() } as never,
      { execute: jest.fn() } as never,
      resetForgottenPassword as never,
    );
    const payload = body();

    const result = await controller.resetForgottenPassword(payload);

    expect(resetForgottenPassword.execute).toHaveBeenCalledWith(payload);
    expect(result).toEqual({ message: MESSAGE });
    expect(result).not.toHaveProperty('accessToken');
    expect(result).not.toHaveProperty('passwordHash');
  });
});
