# Cursor — Agentes Marinheiros

Configuração do Cursor para usar a mesma equipe de agentes definida em `.github/agents/`.

## Estrutura

| Pasta / arquivo | Função |
|-----------------|--------|
| `.cursor/agents/` | Subagents Cursor (prompts especializados) |
| `.cursor/rules/` | Regras persistentes (roteamento da esteira) |
| `.cursor/commands/` | Comandos slash para invocar cada agente |
| `.github/agents/` | Agentes GitHub Copilot (mesmo conteúdo, formato `.agent.md`) |

Ambas as pastas convivem no repo. Ao alterar um agente, atualize **os dois** se quiser paridade entre Cursor e GitHub.

## Como usar

### Esteira completa (feature nova)

1. `/agent-po` — refinar requisitos com BDD
2. `/agent-coordinator` — colar o artefato do PO; receber prompt da próxima fase
3. Repetir até Fase 7 (merge-ready)

### Atalhos diretos

| Comando | Quando usar |
|---------|-------------|
| `/agent-po` | Ideia de produto, histórias, critérios de aceite |
| `/agent-coordinator` | Orquestrar a esteira técnica |
| `/agent-architect` | Blueprint DDD, contratos, paths |
| `/agent-qa` | Testes em RED (TDD) |
| `/agent-dev-backend` | Implementação NestJS |
| `/agent-dev-frontend` | UI React/Vite |
| `/agent-clean-code` | Review de clean code |
| `/observability-lgtm` | Review OTEL / Grafana LGTM |
| `/agent-cicd` | CI/CD, Docker, deploy (sem esteira) |

### Via Task subagent

```
Use o subagent agent-architect para [tarefa]
```
