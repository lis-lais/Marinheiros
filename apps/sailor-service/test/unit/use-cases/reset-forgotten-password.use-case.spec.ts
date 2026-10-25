import { ResetForgottenPasswordInput } from '../../../src/domain/interfaces';
import { ResetForgottenPasswordUseCase } from '../../../src/application/use-cases/reset-forgotten-password.use-case';

const MESSAGE = 'Senha alterada. Entre com a senha nova.';

function input(): ResetForgottenPasswordInput {
  return {
    email: 'teste@marinheiros.local',
    firstName: 'Lais',
    lastName: 'Teste',
    newPassword: 'Nova123',
    confirmPassword: 'Nova123',
  };
}

describe('ResetForgottenPasswordUseCase', () => {
  it('asks the domain service to reset and returns the success message', async () => {
    const service = { reset: jest.fn().mockResolvedValue(undefined) };
    const useCase = new ResetForgottenPasswordUseCase(service);
    const resetInput = input();

    await expect(useCase.execute(resetInput)).resolves.toEqual({ message: MESSAGE });
    expect(service.reset).toHaveBeenCalledWith(resetInput);
  });
});
