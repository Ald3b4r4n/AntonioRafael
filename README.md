# antoniorafael.com.br

Portfólio profissional de **Antônio Rafael Souza Cruz de Noronha** — desenvolvedor Full Stack baseado em Brasília, DF.

**Live:** [www.antoniorafael.com.br](https://www.antoniorafael.com.br/)

---

## Stack

| Camada | Tecnologias |
|--------|-------------|
| **Frontend** | React 19, Vite 7, Framer Motion 12, CSS Modules, TypeScript 5.8 |
| **Backend** | Vercel Serverless Functions, Express 5, Nodemailer 7 |
| **Qualidade** | Vitest 4, Playwright, ESLint 9 (flat config), TypeScript strict |
| **CI/CD** | GitHub Actions (lint → typecheck → unit → integration → build → e2e → security audit) |
| **Infra** | Vercel (deploy automático), Node 22 LTS |

---

## Arquitetura

```
├── api/                        Serverless functions (Vercel)
│   ├── contact.mjs             POST /api/contact — envio de e-mail (rate-limited)
│   ├── health.mjs              GET  /api/health  — health check
│   └── sitemap.mjs             GET  /api/sitemap — sitemap XML dinâmico
│
├── src/
│   ├── components/
│   │   ├── Nav.tsx             Header + navegação por tabs (TypeScript)
│   │   ├── GlassCard.tsx       Componente polimórfico de card glassmorphism
│   │   ├── LanyardBadge.jsx    Crachá interativo com física simulada
│   │   ├── RainCanvas.jsx      Efeito de chuva decorativo (canvas)
│   │   └── SEO.jsx             Meta tags dinâmicas + JSON-LD
│   │
│   ├── hooks/
│   │   ├── useActiveSection.ts Gerenciamento tipado de seção ativa
│   │   └── useReducedMotion.js Respeita prefers-reduced-motion
│   │
│   ├── pages/
│   │   ├── About.jsx           Seção "Sobre Mim"
│   │   ├── Projects.jsx        Showcase de projetos (featured + compactos)
│   │   └── Contact.jsx         Formulário + WhatsApp + LinkedIn
│   │
│   ├── tokens/
│   │   └── tokens.css          Design tokens semânticos (CSS custom properties)
│   │
│   ├── utils/
│   │   └── seo.ts              Utilitários SEO (base URL, canonical)
│   │
│   ├── App.jsx                 Root — orquestra tabs, lanyard e rain
│   ├── index.css               Reset + variáveis globais
│   └── main.jsx                Entry point
│
├── tests/
│   ├── unit/                   Vitest — hooks, utils, smoke
│   ├── integration/            Vitest — API endpoints
│   └── e2e/                    Playwright — smoke, mobile 375px, a11y (axe-core)
│
├── .github/workflows/ci.yml   Pipeline CI completo
├── index.html                  Shell HTML com meta tags de fallback
└── vite.config.js              Config Vite
```

---

## Destaques Técnicos

### Crachá com Física Simulada

O `LanyardBadge` implementa um pêndulo com mola em tempo real via `requestAnimationFrame`:
- Movimento pendular (θ'' = -(g/L)·sin(θ)) com amortecimento
- Alongamento elástico da corda (Lei de Hooke)
- Drag interativo via Framer Motion convertido em forças físicas
- Ancoragem dinâmica ao botão "Projetos" (desktop) ou topo (mobile)
- `prefers-reduced-motion` desabilita animações

### SEO para SPA

- Meta tags dinâmicas via `useEffect` (title, description, canonical, OG, Twitter Cards)
- Schema.org JSON-LD (WebSite + Person) para rich results
- Sitemap XML gerado dinamicamente pela serverless function
- Meta tags de fallback no `index.html` para crawlers que não executam JS

### Design System

- **Design tokens semânticos** em `tokens.css` — cores, espaçamento, tipografia, sombras
- **CSS Modules** com escopo local, sem runtime overhead
- **Glassmorphism** consistente via `GlassCard` polimórfico (TypeScript genérico)
- Tipografia fluida com `clamp()`, contraste WCAG AA

### Qualidade & Acessibilidade

- Validação client-side com inline errors + `aria-invalid` + `role="alert"`
- Labels screen-reader-only, `aria-labelledby`, `aria-live` regions
- Focus visible em todos os interativos, tap targets ≥ 48px
- E2E accessibility tests com axe-core
- Rate limiting no endpoint de contato (express-rate-limit)

---

## Desenvolvimento

### Pré-requisitos

- **Node.js 22** (veja `.nvmrc`)
- **npm** ≥ 9

### Setup

```bash
git clone https://github.com/Ald3b4r4n/portfolio.git
cd portfolio
npm install
```

### Variáveis de ambiente

Crie `.env.local` na raiz:

```env
# Frontend — formulário de contato via Formspree (opcional)
VITE_FORMSPREE_ID=seu_id_formspree

# Frontend — SEO (opcional, fallback: window.location.origin)
VITE_SITE_URL=https://www.antoniorafael.com.br

# Backend — envio de e-mail (necessário para /api/contact)
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx    # App Password do Gmail
EMAIL_PORT=465
EMAIL_SECURE=true
```

### Comandos

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Dev server (Vite HMR) |
| `npm run build` | Build de produção |
| `npm run preview` | Preview da build local |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript strict check |
| `npm test` | Todos os testes (unit + integration) |
| `npm run test:unit` | Testes unitários |
| `npm run test:integration` | Testes de integração (API) |
| `npm run test:e2e` | E2E com Playwright |
| `npm run test:coverage` | Cobertura de código |

---

## Deploy

O projeto faz deploy automático na **Vercel** a cada push em `main`.

1. Importe o repo no [Vercel](https://vercel.com)
2. Framework preset: **Vite**
3. Configure as variáveis de ambiente no painel
4. As funções em `api/` são detectadas automaticamente como Serverless Functions

### CI Pipeline

```
lint + typecheck → unit tests ──┐
                                ├─→ build → e2e tests
integration tests ──────────────┘
security audit ─────────────────────────────────────→
```

---

## Contato

- **Site:** [antoniorafael.com.br](https://www.antoniorafael.com.br/)
- **LinkedIn:** [antonio-rafael-souza-cruz-de-noronha](https://www.linkedin.com/in/antonio-rafael-souza-cruz-de-noronha-249539111/)
- **GitHub:** [@Ald3b4r4n](https://github.com/Ald3b4r4n)
- **WhatsApp:** [+55 61 98288-7294](https://wa.me/5561982887294)

---

## Licença

Projeto privado. Todos os direitos reservados.
