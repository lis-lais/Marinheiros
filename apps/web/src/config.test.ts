import * as fs from 'fs';
import * as path from 'path';

describe('Deployment Configuration Tests', () => {
  it('should have base path set to /marinheiros/ in vite.config.ts', () => {
    const viteConfigPath = path.resolve(__dirname, '../vite.config.ts');
    const content = fs.readFileSync(viteConfigPath, 'utf8');
    expect(content).toContain("base: '/marinheiros/'");
  });

  it('should have API_BASE set to relative /marinheiros/api in App.tsx', () => {
    const appPath = path.resolve(__dirname, './App.tsx');
    const content = fs.readFileSync(appPath, 'utf8');
    expect(content).toContain("const API_BASE = '/marinheiros/api';");
  });

  it('should read MONGODB_URI from environment in docker-compose.yml', () => {
    const composePath = path.resolve(__dirname, '../../../docker-compose.yml');
    const content = fs.readFileSync(composePath, 'utf8');
    expect(content).toContain('MONGODB_URI=${MONGODB_URI}');
  });
});
