import axios from 'axios';
import { AuthController } from '../../../src/controllers/auth.controller';
import { SailorProxyService } from '../../../src/services/sailor-proxy.service';

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

describe('AuthController password reset', () => {
  it('forwards the body and returns it without an access token', async () => {
    const resetForgottenPassword = jest.fn().mockResolvedValue({ message: MESSAGE });
    const jwtService = { sign: jest.fn() };
    const controller = new AuthController({ resetForgottenPassword } as never, jwtService as never);
    const payload = body();

    const result = await controller.resetForgottenPassword(payload);

    expect(resetForgottenPassword).toHaveBeenCalledWith(payload);
    expect(result).toEqual({ message: MESSAGE });
    expect(result).not.toHaveProperty('accessToken');
    expect(jwtService.sign).not.toHaveBeenCalled();
  });
});

describe('SailorProxyService password reset', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('posts the body to /password-resets on the sailors base url', async () => {
    const post = jest.fn().mockResolvedValue({ data: { message: MESSAGE } });
    jest.spyOn(axios, 'create').mockReturnValue({ post } as never);
    const proxy = new SailorProxyService();
    const payload = body();

    await expect(proxy.resetForgottenPassword(payload)).resolves.toEqual({ message: MESSAGE });
    expect(post).toHaveBeenCalledWith('/password-resets', payload);
  });
});
