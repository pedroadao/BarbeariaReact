# Barbearia React

Frontend React para a [API de Barbearia](https://github.com/pedroadao/Barbearia), desenvolvido para fins de estudo. Permite o cadastro de barbeiros e clientes e o gerenciamento de horários (agendamentos) na agenda dos barbeiros.

## Tech Stack

- React 19 + TypeScript (`strict`)
- Vite
- React Router
- TanStack Query (cache e sincronização de dados remotos)
- React Hook Form + Zod (formulários e validação)
- oxlint (lint)
- Vitest + React Testing Library (testes)

## Funcionalidades

- **Barbeiros**: listar, criar, editar e excluir.
- **Clientes**: listar, criar, editar e excluir.
- **Agendamentos**: listar, criar (associando barbeiro e, opcionalmente, cliente) e excluir horários.

## Como executar

### Com Docker

Este repositório possui um `Dockerfile` que builda a aplicação com Vite e a serve via nginx. Ele é consumido pelo `docker-compose.yml` do repositório irmão [`Barbearia`](../Barbearia), que sobe também a API e o Postgres.

Pré-requisito: este repositório (`BarbeariaReact`) deve estar clonado no diretório irmão de `Barbearia` (ou seja, `../BarbeariaReact` a partir de `Barbearia`).

```bash
cd ../Barbearia
docker compose --env-file .env.developer up -d --build
```

O frontend fica disponível em `http://localhost:${WEB_PORT}` (porta definida no `.env`/`.env.developer` do repositório `Barbearia`, por padrão `8082`).

Para buildar e rodar apenas a imagem deste frontend isoladamente (sem o compose do backend):

```bash
docker build -t barbearia-react --build-arg VITE_API_BASE_URL=http://localhost:8081 .
docker run -p 8082:80 barbearia-react
```

> A variável `VITE_API_BASE_URL` é incorporada ao bundle durante o build (Vite), portanto precisa ser definida como build arg — alterá-la depois exige rebuildar a imagem.

### Localmente (sem Docker)

Requer a API do `Barbearia` rodando (local ou via Docker) e Node.js instalado.

1. Copie `.env.example` para `.env.local` e ajuste `VITE_API_BASE_URL` para a URL da API:

```bash
cp .env.example .env.local
```

2. Instale as dependências e rode o servidor de desenvolvimento:

```bash
npm install
npm run dev
```

A aplicação fica disponível em `http://localhost:5174`.

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `VITE_API_BASE_URL` | URL base da API do Barbearia (ex.: `http://localhost:8081`) |

`.env.local` não é versionado; use `.env.example` como referência.

## Scripts disponíveis

```bash
npm run dev        # servidor de desenvolvimento (Vite)
npm run build      # typecheck + build de produção
npm run lint        # lint (oxlint)
npm run typecheck   # verificação de tipos TypeScript
npm run test        # testes (Vitest)
npm run preview     # preview do build de produção
```

## Observações sobre o contrato da API

- A API não expõe autenticação nem atualização (`PUT`) de agendamentos; por isso a tela de Agendamentos permite apenas criar (com ou sem cliente associado) e excluir horários.
- O campo "Tipo de usuário" é enviado automaticamente pelo frontend (fixo por tela) e não é exibido nos formulários de Barbeiro/Cliente.
