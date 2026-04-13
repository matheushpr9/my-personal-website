# Matheus Ptasinski — Personal Website

Site pessoal / portfólio com seções de experiência profissional, projetos, formação, livros, game reviews e receitas. Inclui painel admin (`/admin`) para gerenciar todo o conteúdo via API.

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** — build tool
- **Tailwind CSS** + **ShadCN/UI** — estilização e componentes
- **Framer Motion** — animações
- **React Router** — roteamento SPA
- **React Query** — data fetching e cache
- **Zod** + **React Hook Form** — validação

## Estrutura do Projeto

```
src/
├── components/           # Seções públicas do site
│   ├── AboutSection.tsx        # Bio, skills e tools
│   ├── ExperienceSection.tsx   # Timeline de experiências
│   ├── ProjectsSection.tsx     # Projetos pessoais
│   ├── EducationSection.tsx    # Formação acadêmica
│   ├── BooksSection.tsx        # Reviews de livros
│   ├── GameReviewsSection.tsx  # Reviews de jogos
│   ├── RecipesSection.tsx      # Receitas
│   ├── Navbar.tsx              # Navegação + seletor de idioma
│   └── Footer.tsx
├── pages/
│   ├── Index.tsx         # Página principal (portfólio)
│   ├── NotFound.tsx
│   └── admin/
│       ├── Login.tsx     # Tela de login do admin
│       ├── Admin.tsx     # Dashboard com tabs por entidade
│       └── CrudEditor.tsx # Componente genérico de CRUD
├── hooks/
│   └── use-api.ts        # React Query hooks + tipos de todas as entidades
├── lib/
│   ├── api.ts            # HTTP client com auth (Bearer JWT)
│   └── utils.ts
├── contexts/
│   └── LanguageContext.tsx # Contexto PT/EN
└── App.tsx               # Rotas: /, /admin, /admin/login
```

## Rotas

| Rota | Descrição |
|------|-----------|
| `/` | Site público (portfólio) |
| `/admin/login` | Login do painel admin |
| `/admin` | Painel de gerenciamento de conteúdo (requer autenticação) |

## Entidades Gerenciáveis

O painel admin permite CRUD completo de 9 entidades, todas com suporte bilíngue (PT/EN):

| Entidade | Campos principais |
|----------|-------------------|
| **About** | Bio, anos de experiência, localização |
| **Skills** | Nome, nível (0-100), label |
| **Tools** | Nome |
| **Experiences** | Período, título, empresa, descrição, tags, ativo |
| **Projects** | Nome, descrição, tags, URL |
| **Education** | Título, instituição, período |
| **Books** | Título, autor, gênero, tipo, score, review, highlights |
| **Game Reviews** | Nome, tipo (videogame/boardgame), gênero, plataforma, score, review, prós/contras |
| **Recipes** | Emoji, nome, detalhe, tag, tempo, porções, dificuldade, ingredientes, passos |

## Fallback

Todos os componentes públicos possuem dados mockados como fallback. Se a API não estiver disponível ou retornar vazio, o site exibe o conteúdo estático normalmente.

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Rodar em dev
npm run dev

# Build para produção
npm run build

# Lint
npm run lint

# Testes
npm test
```

## Variáveis de Ambiente

Crie um `.env` na raiz (veja `.env.example`):

```env
# URL da API — em produção na Hostinger, use /api (mesmo domínio)
VITE_API_URL=/api
```

## Deploy na Hostinger (Business Web Hosting)

O plano Business da Hostinger roda Apache + PHP + MySQL. O frontend é servido como arquivos estáticos.

1. Rode `npm run build` — gera a pasta `dist/`
2. Suba o conteúdo de `dist/` para `public_html/` na Hostinger (via File Manager ou FTP)
3. Crie um `.htaccess` na raiz do `public_html/` para suportar SPA routing:

```apache
RewriteEngine On
RewriteBase /
RewriteRule ^api/ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

> Isso garante que rotas como `/admin` sejam tratadas pelo React Router, enquanto `/api/*` é encaminhado para o backend PHP.

### Estrutura final no servidor

```
public_html/
├── .htaccess          ← SPA routing (acima)
├── index.html         ← build do React
├── assets/            ← JS/CSS do build
└── api/               ← backend (repo separado)
```

## Repositório Relacionado

- **Backend API:** [my-personal-api](../my-personal-api/) — PHP + MySQL REST API que serve os dados deste site
