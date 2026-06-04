# Plataforma Marinheiros

Aplicação dividida em microserviços NestJS com arquitetura DDD para gerenciar marinheiros e seus períodos de embarque/desembarque.

## Microserviços

- `@marinheiros/sailor-service`: cadastro e consulta de marinheiros.
- `@marinheiros/schedule-service`: agendamento de embarque e desembarque.
- `@marinheiros/api-gateway`: gateway REST que orquestra os dois serviços.

## Portas

- `API Gateway`: 3000
- `Sailor Service`: 3001
- `Schedule Service`: 3002

## Como usar

1. Instale dependências:

```bash
npm install
```

2. Execute os serviços separados:

```bash
npm run start:sailor
npm run start:schedule
npm run start:gateway
```

3. Use o gateway para acessar os microserviços:

- `POST /sailors`
- `GET /sailors`
- `GET /sailors/:id`
- `POST /schedules`
- `GET /schedules`
- `GET /schedules/sailor/:sailorId`

## Banco de Dados (MongoDB)

O projeto agora suporta MongoDB via `mongoose` e `@nestjs/mongoose`. As services usam a variável de ambiente `MONGODB_URI` para a conexão. Exemplo de valor local:

```
mongodb://localhost:27017/marinheiros
```

No Render, adicione `MONGODB_URI` como um environment variable apontando para o seu cluster (Atlas URI ou serviço gerenciado). Ou conecte um add-on MongoDB e insira a string de conexão em `MONGODB_URI`.

## Deploy no Render

O repositório inclui um arquivo `render.yaml` que descreve os três serviços Docker:

- `api-gateway` (porta 3000)
- `sailor-service` (porta 3001)
- `schedule-service` (porta 3002)

Passos rápidos para publicar no Render:

1. Faça push do repositório para um provider Git (GitHub, GitLab, etc.).

```bash
git add .
git commit -m "Add render.yaml and health endpoint"
git push origin main
```

2. No dashboard do Render, crie um novo serviço e conecte seu repositório. O Render detectará o arquivo `render.yaml` e criará os serviços automaticamente. Alternativamente, acione "Create a new service" e escolha "Deploy using Dockerfile" apontando para os Dockerfiles em `services/*`.

3. Variáveis de ambiente podem ser definidas no painel do Render; por padrão `PORT` está configurado via `render.yaml`.

4. Verifique a saúde do gateway em: `https://<seu-service>.onrender.com/health`

Observação: se você usa outra branch, atualize o campo `branch` em `render.yaml` antes do deploy.
