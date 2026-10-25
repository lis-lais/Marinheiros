import { ResetForgottenPasswordInput } from '../../domain/interfaces';

const MESSAGE = 'Senha alterada. Entre com a senha nova.';

interface PasswordReset {
  reset(input: ResetForgottenPasswordInput): Promise<void>;
}

export class ResetForgottenPasswordUseCase {
  constructor(private readonly service: PasswordReset) {}

  async execute(input: ResetForgottenPasswordInput): Promise<{ message: string }> {
    await this.service.reset(input);
    return { message: MESSAGE };
  }
}
