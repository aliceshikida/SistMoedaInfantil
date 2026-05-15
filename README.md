# Sistema de Moeda Estudantil

Plataforma web de reconhecimento academico baseada em moedas virtuais.
Professores enviam moedas para alunos, alunos acumulam saldo e trocam por vantagens cadastradas por empresas parceiras.
O sistema controla transacoes, extrato, cupons e dashboards por perfil.

## Visao geral

- Perfis de acesso: `ALUNO`, `PROFESSOR`, `EMPRESA`, `ADMIN`
- Autenticacao: JWT com middleware de autenticacao e autorizacao por perfil
- Camadas: Controllers -> Services -> Prisma
- Persistencia: Prisma ORM (execucao local atualmente com SQLite para facilitar setup)
- Front-end dark-first e responsivo

## Stack utilizada

### Front-end
- React + Vite
- React Router
- Axios
- React Hook Form + Zod
- TailwindCSS
- Recharts
- React Toastify

### Back-end
- Node.js + Express
- Prisma ORM
- JWT
- bcryptjs
- Multer (upload de imagem)
- Nodemailer (emails)
- Swagger (documentacao da API)

## Arquitetura de pastas

```text
.
├── backend
│   ├── prisma
│   │   ├── schema.prisma
│   │   └── seed.js
│   └── src
│       ├── config
│       ├── controllers
│       ├── middlewares
│       ├── prisma
│       ├── routes
│       ├── services
│       └── utils
├── frontend
│   └── src
│       ├── components
│       ├── hooks
│       ├── lib
│       ├── pages
│       └── providers
└── docker-compose.yml
```

## Funcionalidades implementadas

### Autenticacao e autorizacao
- Login com JWT
- Cadastro publico de aluno e empresa
- Professores pre-cadastrados via seed
- Middleware por perfil

### Fluxo do professor
- Login no sistema
- Visualizacao de alunos
- Envio de moedas com mensagem obrigatoria
- Validacao de saldo antes do envio
- Debito no professor e credito no aluno
- Registro de transacoes (`ENVIO` e `RECEBIMENTO`)
- Credito semestral automatico (+1000 acumulativo no login por semestre)

### Fluxo do aluno
- Cadastro com instituicao selecionada
- Saldo inicial 0
- Visualizacao de extrato
- Visualizacao de vantagens
- Resgate de vantagem com validacao de saldo
- Geracao de cupom unico
- Registro de transacao de `RESGATE`

### Fluxo da empresa
- Cadastro e login
- Cadastro de vantagens (com upload opcional de foto)
- Listagem de vantagens proprias
- Visualizacao de cupons resgatados

### Dashboards
- Dashboard do aluno: saldo, extrato recente e trocas recentes
- Dashboard do professor: saldo, envios e alunos reconhecidos
- Dashboard da empresa: quantidade de vantagens e total de resgates
- Dashboard admin: indicadores gerais

## Banco de dados

O projeto foi desenhado para PostgreSQL, mas para execucao local rapida esta configurado em SQLite.

- Arquivo local do banco: `backend/dev.db`
- Schema: `backend/prisma/schema.prisma`
- Seed: `backend/prisma/seed.js`

## Variaveis de ambiente

Copie:

- `backend/.env.example` -> `backend/.env`
- `frontend/.env.example` -> `frontend/.env`

### Backend (`backend/.env`)

```env
PORT=4000
NODE_ENV=development
DATABASE_URL="file:./dev.db"
JWT_SECRET=super_secret_jwt
JWT_EXPIRES_IN=1d
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
# É necessário entrar no ethereal, gerar as credenciais e altera-las abaixo para vizualizar os emails
SMTP_USER=user
SMTP_PASS=pass
SMTP_FROM="Sistema de Moeda Estudantil <noreply@sme.local>"
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:4000/api
```

## Como rodar localmente (recomendado)

### Backend

```bash
cd backend
npm install
npm install qrcode
npx prisma generate
npx prisma db push
npm run prisma:seed
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev -- --host
```

## URLs locais

- Frontend: [http://localhost:5173](http://localhost:5173)
- API: [http://localhost:4000/api](http://localhost:4000/api)
- Health: [http://localhost:4000/api/health](http://localhost:4000/api/health)
- Swagger: [http://localhost:4000/docs](http://localhost:4000/docs)

## Credenciais seed

- Admin:
  - email: `admin@sme.local`
  - senha: `Admin@123`

- Professor principal:
  - login: `professor@dominio.com`
  - senha: `12345678`

- Professor alternativo:
  - email/login: `professor2@sme.local`
  - senha: `12345678`

## Endpoints principais

### Auth
- `POST /api/auth/register/aluno`
- `POST /api/auth/register/empresa`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Core
- `GET /api/instituicoes`
- `GET /api/vantagens`
- `GET /api/dashboard`
- `GET /api/extrato`

### Professor
- `GET /api/professor/alunos`
- `POST /api/professor/enviar-moedas`

### Aluno
- `POST /api/aluno/resgatar`
- `GET /api/aluno/cupons`

### Empresa
- `POST /api/empresa/vantagens`
- `GET /api/empresa/vantagens`
- `GET /api/empresa/cupons`

## Fluxo funcional resumido

1. Aluno/empresa se cadastra e recebe token JWT
2. Professor pre-cadastrado faz login
3. Professor envia moedas para aluno
4. Aluno visualiza saldo e extrato
5. Aluno resgata vantagem
6. Sistema gera cupom e registra transacao
7. Empresa visualiza cupons resgatados

## Scripts uteis

### Backend
- `npm run dev`
- `npm run start`
- `npm run prisma:seed`
- `npm run prisma:generate`
- `npm run prisma:list-vantagens` — lista vantagens na base atual; use `npm run prisma:list-vantagens -- "postgresql://..."` para ver a base de **produção** (a mesma que o Vercel usa via API).
- `npm run prisma:wipe-vantagens` — apaga todas as vantagens (e cupons) na base atual; com `-- "postgresql://..."` apaga na base remota.
- `npm run lint`

### Frontend
- `npm run dev`
- `npm run build`
- `npm run preview`

## Docker

O arquivo `docker-compose.yml` esta no projeto.
Atualmente a execucao validada nesta maquina foi em modo local (sem Docker), com banco SQLite.

## Troubleshooting

- Erro de login: rode novamente `npm run prisma:seed` no backend
- Sem dados no sistema: confirme `npx prisma db push` + `npm run prisma:seed`
- Erro de API no frontend: confira `VITE_API_URL` no `frontend/.env`
- **Fotos em `/uploads` no Vercel mostram tipo `html`:** o fallback SPA (`/(.*)` → `index.html`) capturava também `/uploads/...`. O `vercel.json` agora usa `handle: filesystem` e exclui caminhos que começam por `uploads` ou `api` desse fallback. As imagens **só carregam** se o build tiver `VITE_API_URL` (ou `VITE_PUBLIC_FILES_ORIGIN`) absolutos apontando para o **mesmo host** onde o Express serve `/uploads` — senão o pedido a `*.vercel.app/uploads/...` passa a ser **404** até configurares.
- **Vercel mostra vantagens antigas após `wipe` local:** o frontend em produção lê a API noutro host; a base é a do **Postgres** (Neon, Supabase, Render, etc.), não o `dev.db` local. Confirma com `npm run prisma:list-vantagens -- "postgresql://..."` se o título (ex. clube do livro) está **nessa** base. Para apagar: `npm run prisma:wipe-vantagens -- "postgresql://..."` (string completa entre aspas). No site em produção, F12 → Rede → recarrega `/vantagens` e verifica o URL do `GET .../vantagens` (é o backend real). Alternativa: consola SQL do provedor.
- Email falhando: em ambiente local, o envio de email nao bloqueia os fluxos principais

## Melhorias futuras sugeridas

- Migrar novamente para PostgreSQL em producao
- Testes automatizados (unit e integracao)
- Painel admin completo com CRUDs e bloqueio de usuarios
- Paginacao/filtros avancados em todas as listagens
