# Matheus Ptasinski — Personal Website

Site pessoal / portfólio com seções de experiência profissional, projetos, formação, livros, game reviews e receitas. Inclui painel admin (`/admin`) para gerenciar todo o conteúdo via API.

## Tech Stack

**Frontend**
- React 18 + TypeScript + Vite
- Tailwind CSS + ShadCN/UI + Framer Motion
- React Router + React Query

**Backend**
- Go + [Chi](https://github.com/go-chi/chi)
- SQLite (via `modernc.org/sqlite` — pure Go, sem CGO)
- JWT para autenticação do admin

---

## Estrutura do Projeto

```
my-personal-website/
├── src/                    # Frontend React
│   ├── components/         # Seções públicas do site
│   ├── pages/
│   │   ├── Index.tsx       # Página principal
│   │   └── admin/          # Login + painel admin
│   ├── hooks/use-api.ts    # React Query hooks + tipos
│   └── lib/api.ts          # HTTP client com auth JWT
├── backend/                # API Go
│   ├── main.go
│   ├── internal/
│   │   ├── db/db.go        # SQLite + migrations
│   │   └── handlers/       # auth + CRUD genérico
│   └── .env.example
├── public/
└── vite.config.ts          # proxy /api → localhost:3000 em dev
```

---

## Rodando Localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) ≥ 18
- [Go](https://go.dev/) ≥ 1.22

### 1. Backend

```bash
cd backend

# Copiar e editar variáveis de ambiente
cp .env.example .env
```

Edite o `.env`:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=minha-senha       # texto puro no dev, bcrypt em prod
JWT_SECRET=troque-por-chave-longa
DB_PATH=data.db
PORT=3000
```

```bash
# Baixar dependências (só na primeira vez)
go mod tidy

# Rodar o servidor (porta 3000)
go run .
```

O banco SQLite (`data.db`) é criado automaticamente na primeira execução com todas as tabelas.

### 2. Frontend

Em outro terminal, na raiz do projeto:

```bash
npm install
npm run dev        # http://localhost:8080
```

O Vite já faz proxy de `/api` para `localhost:3000`, então frontend e backend funcionam juntos sem configuração extra.

### Rotas

| Rota | Descrição |
|------|-----------|
| `http://localhost:8080/` | Site público |
| `http://localhost:8080/admin/login` | Login do admin |
| `http://localhost:8080/admin` | Painel de gerenciamento |

---

## Entidades (CRUD via Admin)

Todas com suporte bilíngue PT/EN:

| Entidade | Campos principais |
|----------|-------------------|
| **About** | Bio, anos de experiência, localização |
| **Skills** | Nome, nível (0-100), label |
| **Tools** | Nome |
| **Experiences** | Período, título, empresa, descrição, tags, ativo |
| **Projects** | Nome, descrição, tags, URL |
| **Education** | Título, instituição, período |
| **Books** | Título, autor, gênero, tipo, score, review, highlights |
| **Game Reviews** | Nome, tipo (videogame/boardgame), plataforma, score, prós/contras |
| **Recipes** | Emoji, nome, tag, tempo, ingredientes, passos |

---

## API Endpoints

```
POST   /api/auth/login          → { token }   (público)

GET    /api/{recurso}           → []Item       (público)
POST   /api/{recurso}           → { id }       (requer JWT)
PUT    /api/{recurso}/{id}      → ok           (requer JWT)
DELETE /api/{recurso}/{id}      → ok           (requer JWT)
```

Recursos: `about`, `skills`, `tools`, `experiences`, `projects`, `education`, `books`, `game_reviews`, `recipes`

---

## Deploy — VPS Hostinger

**Infraestrutura usada:**
- VPS Hostinger com Ubuntu
- Domínio: `www.bymatheus.com.br` (A record apontando para o IP do VPS)
- `bymatheus.com.br` (sem www) mantido separado para outro projeto

### 1. DNS

No painel da Hostinger → **Domínios → Gerenciar DNS**, configurar:

| Tipo | Nome | Conteúdo |
|------|------|----------|
| A | `@` | IP do outro site (não mexer) |
| A | `www` | IP do VPS |

> O `www` deve ser um **A record** direto para o IP do VPS, não um CNAME.

### 2. Setup inicial do servidor

```bash
ssh root@<IP_DO_VPS>

# Dependências
apt update && apt install -y nginx certbot python3-certbot-nginx

# Diretório da aplicação
mkdir -p /var/www/bymatheus/public
```

### 3. Serviço systemd

```bash
cat > /etc/systemd/system/bymatheus-api.service << 'EOF'
[Unit]
Description=bymatheus.com.br API
After=network.target

[Service]
WorkingDirectory=/var/www/bymatheus
ExecStart=/var/www/bymatheus/api
EnvironmentFile=/var/www/bymatheus/.env
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
```

### 4. Nginx

```bash
cat > /etc/nginx/sites-available/bymatheus << 'EOF'
server {
    listen 80;
    server_name www.bymatheus.com.br;

    root /var/www/bymatheus/public;
    index index.html;

    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

ln -s /etc/nginx/sites-available/bymatheus /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

### 5. Variáveis de ambiente no servidor

```bash
cat > /var/www/bymatheus/.env << 'EOF'
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<senha ou hash bcrypt>
JWT_SECRET=<string longa e aleatória>
DB_PATH=/var/www/bymatheus/data.db
PORT=3000
EOF
```

> Para gerar um hash bcrypt da senha: `cd backend && go run ./tools/hash/main.go 'sua-senha'`

### 6. Build e deploy

Na sua máquina local:

```bash
./deploy.sh
```

O script faz o build do frontend e do backend, envia os arquivos por SCP e reinicia o serviço automaticamente.

### 7. Ativar o serviço e HTTPS

```bash
ssh root@<IP_DO_VPS>

# Ativar o backend
systemctl daemon-reload
systemctl enable bymatheus-api
systemctl start bymatheus-api
systemctl status bymatheus-api   # deve mostrar "active (running)"

# SSL
certbot --nginx -d www.bymatheus.com.br --non-interactive --agree-tos -m <seu@email.com>
```

O Certbot configura o HTTPS e renova o certificado automaticamente.

### Atualizando o site

Para qualquer atualização futura, basta rodar na raiz do projeto:

```bash
./deploy.sh
```

---

## Scripts Úteis

```bash
# Frontend
npm run dev          # dev server (porta 8080)
npm run build        # build de produção
npm run lint         # ESLint
npm test             # Vitest

# Backend
cd backend
go run .             # dev server (porta 3000)
go build -o api .    # compilar binário local
go run ./tools/hash/main.go <senha>   # gerar hash bcrypt
```
