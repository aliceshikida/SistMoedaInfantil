# Sistema de Moeda Estudantil

Sistema web completo para reconhecimento acadêmico com moedas virtuais: professores enviam moedas para alunos, alunos resgatam vantagens de empresas parceiras e o admin acompanha estatísticas gerais.

## Stack

- **Front-end:** React + Vite + TailwindCSS + React Router + Axios + React Hook Form + Zod
- **Back-end:** Node.js + Express + JWT + Multer + Nodemailer + Swagger
- **Banco:** PostgreSQL + Prisma ORM
- **Arquitetura:** MVC + Services + Middlewares + rotas protegidas por perfil
- **Infra:** Docker Compose

## Estrutura de pastas

```text
.
├── frontend/
├── backend/
└── docker-compose.yml
```

## Funcionalidades implementadas

- Autenticação JWT com `aluno`, `professor`, `empresa` e `admin`
- Cadastro de aluno e empresa com login automático
- CRUD inicial de vantagens com upload de imagem
- Envio de moedas por professor para aluno (com validação de saldo)
- Resgate de vantagens por aluno com geração de cupom único
- Extrato/transações por usuário
- Dashboard por perfil
- Envio de e-mails (boas-vindas, recebimento de moedas, resgate)
- Swagger em `/docs`
- Seed com usuário admin e professores pré-cadastrados

## Variáveis de ambiente

Copie os exemplos:

- `backend/.env.example` -> `backend/.env`
- `frontend/.env.example` -> `frontend/.env`

### Backend (`backend/.env`)

```env
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sme_db?schema=public
JWT_SECRET=super_secret_jwt
JWT_EXPIRES_IN=1d
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=user
SMTP_PASS=pass
SMTP_FROM="Sistema de Moeda Estudantil <noreply@sme.local>"
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:4000/api
```

## Como rodar localmente

### 1) Subir PostgreSQL (Docker)

```bash
docker compose up -d db
```

### 2) Backend

```bash
cd backend
npm install
npx prisma migrate dev --name init
npx prisma generate
npm run prisma:seed
npm run dev
```

### 3) Frontend

```bash
cd frontend
npm install
npm run dev
```

## Rodando tudo com Docker Compose

```bash
docker compose up --build
```

## Endpoints principais

- `POST /api/auth/register/aluno`
- `POST /api/auth/register/empresa`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/dashboard`
- `GET /api/extrato`
- `POST /api/professor/enviar-moedas`
- `POST /api/aluno/resgatar`
- `GET /api/vantagens`
- `POST /api/empresa/vantagens`

## Fluxo da aplicação

1. Aluno/empresa realiza cadastro e recebe token JWT.
2. Professor (pré-cadastrado) envia moedas para alunos com mensagem obrigatória.
3. Aluno visualiza saldo/extrato e resgata vantagens disponíveis.
4. Sistema gera cupom único e dispara e-mails para aluno e empresa.
5. Admin acompanha métricas consolidadas no dashboard.

## Usuários seed

- **Admin:** `admin@sme.local` / `Admin@123`
- **Professores:** `professor1@sme.local` e `professor2@sme.local` / `Professor@123`

## Swagger e documentação

- Acesse: [http://localhost:4000/docs](http://localhost:4000/docs)

## Prints do sistema

Você pode adicionar screenshots em uma pasta `docs/prints` e referenciar no README:

```md
![Login](docs/prints/login.png)
![Dashboard](docs/prints/dashboard.png)
```