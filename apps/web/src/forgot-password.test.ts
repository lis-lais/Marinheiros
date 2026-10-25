import * as fs from 'fs';
import * as path from 'path';

const MESSAGE = 'Senha alterada. Entre com a senha nova.';

describe('Forgot password screen', () => {
  const content = fs.readFileSync(path.resolve(__dirname, './App.tsx'), 'utf8');
  const normalized = content.toLowerCase();

  it('offers the reset form on the login screen and posts to the auth route', () => {
    expect(content).toContain('Esqueci a senha');
    expect(content).toContain('E-mail');
    expect(content).toContain('Nome');
    expect(content).toContain('Sobrenome');
    expect(normalized).toContain('senha nova');
    expect(normalized.includes('repetir') || normalized.includes('repetição')).toBe(true);
    expect(content).toContain('/auth/password-resets');
    expect(content).toContain(MESSAGE);
  });
});
