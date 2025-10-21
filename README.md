# Portfólio — Antônio Rafael

Bem-vindo ao repositório do meu portfólio. Este projeto é uma Single-Page Application (SPA) construída com React + Vite, com foco em uma experiência visual caprichada, boa performance e SEO sólido para ranquear pelo nome completo “Antônio Rafael Souza Cruz de Noronha”.

## Visão geral

- Tabs principais: Sobre Mim, Projetos e Contato (SPA controlada por estado).
- Crachá pendurado (Lanyard) com física: ângulo, alongamento da corda e quique; ancorado ao botão “Projetos” no desktop e ao topo no mobile. Só aparece na aba Sobre Mim.
- Efeitos visuais leves (chuva sutil) sem comprometer usabilidade.
- SEO dinâmico: meta tags, canonical, Open Graph/Twitter e JSON-LD (WebSite e Person) gerados em tempo de execução.
- Sitemap dinâmico via função serverless e robots.txt apontando para ele.
- Endpoint de contato via e-mail com Nodemailer.

## Stack técnica

- React 19 + Vite 7
- CSS Modules (estilos por componente)
- Framer Motion (animações do crachá)
- Funções serverless (pasta `api/` — modelo Vercel) com Nodemailer
- ESLint 9 (config moderna, zero-bundle)

## Estrutura do projeto

```
portfolio/
  api/                 # Funções serverless (Vercel)
    contact.mjs        # POST /api/contact — envia e-mail
    health.mjs         # GET /api/health — verificação rápida
    sitemap.mjs        # GET /api/sitemap — sitemap dinâmico
  public/
    manifest.webmanifest
    robots.txt         # aponta para /api/sitemap
    sitemap.xml        # fallback estático
  src/
    App.jsx            # Navegação por tabs + injeção condicional do crachá
    components/
      Nav.jsx          # Header + tabs; expõe data-lanyard-anchor="projects"
      LanyardBadge.jsx # Crachá com física (pêndulo + mola)
      SEO.jsx          # Injeção de meta tags, canonical e JSON-LD
      RainCanvas.jsx   # Efeito de chuva sutil (decorativo)
    pages/
      About.jsx        # Página inicial (crachá visível aqui)
      Projects.jsx
      Contact.jsx
  index.html           # Head base, título e metas de fallback
  package.json         # scripts, deps e devDeps
  vite.config.js       # plugin React
  eslint.config.js
```

## Destaques de implementação

### Navegação e layout

- `Nav.jsx` calcula a altura do header e exporta em `--nav-h` (CSS custom property) para outras seções.
- O botão “Projetos” possui `data-lanyard-anchor="projects"` e serve de âncora horizontal para o crachá no desktop.
- No mobile, o crachá é posicionado de forma relativa ao fluxo para não cobrir o texto.

### Crachá com física (`LanyardBadge.jsx`)

- Física simples sem dependências extras: pêndulo (ângulo) + mola (alongamento) + amortecimento e quique.
- Drag natural (direção corrigida), e imagem do crachá com drag nativo desativado.
- O ponto de pivô acompanha o botão “Projetos” no desktop; em telas pequenas, centraliza a partir do topo da página.
- Renderizado apenas na aba “Sobre Mim” (controle em `App.jsx`).

### SEO dinâmico (`SEO.jsx`)

- Título padrão e por página, `canonical` dinâmico e metas Open Graph/Twitter.
- JSON-LD para `WebSite` e `Person` com nome completo do autor e perfis.
- Base URL detectada via `VITE_SITE_URL` ou `window.location.origin` (quando disponível).
- Alternates opcionais via `VITE_ALT_DOMAINS` (lista separada por vírgula).

### Sitemap e robots

- `public/robots.txt` aponta para `/api/sitemap`, que gera URLs usando o domínio atual da requisição.
- `public/sitemap.xml` é apenas um fallback estático de emergência.

### Contato por e-mail (`api/contact.mjs`)

- Endpoint POST que recebe `{ name, email, phone?, message }` e envia via Gmail (App Password) com Nodemailer.
- Variáveis de ambiente:
  - `EMAIL_USER`, `EMAIL_PASS`
  - `CLINICA_EMAIL` (opcional; se não informado, usa `EMAIL_USER` como destinatário)
  - `EMAIL_PORT` (465 padrão) e `EMAIL_SECURE` ("true" para SSL 465, "false" para STARTTLS 587)

## Como rodar localmente

Requisitos:

- Node.js 18+ (recomendado LTS)

Instalação e execução:

```powershell
# instalar dependências
npm install

# subir o servidor de desenvolvimento (Vite)
npm run dev
```

Build e preview de produção:

```powershell
# gerar build de produção
npm run build

# servir a build gerada
npm run preview
```

Lint:

```powershell
npm run lint
```

## Variáveis de ambiente

Crie um arquivo `.env` (ou configure no ambiente de deploy):

- Front/SEO (opcional):
  - `VITE_SITE_URL` — domínio canônico (ex.: `https://seu-dominio.com`)
  - `VITE_ALT_DOMAINS` — outros domínios/espelhos separados por vírgula
- API de contato (obrigatória para enviar e-mails):
  - `EMAIL_USER` — conta Gmail (com App Password)
  - `EMAIL_PASS` — App Password dessa conta
  - `CLINICA_EMAIL` — destinatário; se ausente, usa `EMAIL_USER`
  - `EMAIL_PORT` — 465 (SSL) ou 587 (STARTTLS)
  - `EMAIL_SECURE` — "true" para 465, "false" para 587

## Deploy (Vercel recomendado)

1. Importe o repositório na Vercel.
2. Configure as variáveis de ambiente listadas acima.
3. Build Command: `npm run build` | Output: `dist/` (default Vite)
4. As rotas em `api/*.mjs` serão publicadas como Serverless Functions automaticamente.
5. Após o deploy, o sitemap dinâmico estará em `https://seu-dominio/api/sitemap` e o `robots.txt` já aponta para ele.

## Boas práticas e acessibilidade

- Imagens com `alt` descritivo e `loading="lazy"` quando aplicável.
- Interações de arrastar no crachá com limites e amortecimento para evitar comportamento instável.
- Conteúdo textual em português-BR e metas de SEO coerentes com o público-alvo.

## Roadmap (ideias futuras)

- Estados carregados por URL (deep-link para cada tab: `/`, `/projetos`, `/contato`).
- Página de projetos com cartões detalhados e filtros.
- Validação e feedback de formulário de contato no front-end, com rate-limit na API.
- Testes unitários para a física do crachá e utilitários de SEO.

## Autor

- Antônio Rafael Souza Cruz de Noronha  
  GitHub: https://github.com/Ald3b4r4n  
  LinkedIn: https://www.linkedin.com/in/antonio-rafael-souza-cruz-de-noronha-249539111/  
  WhatsApp: https://wa.me/5561982887294

---

Projeto marcado como `private` neste `package.json`. Caso queira abrir o código, inclua uma licença e ajuste o campo `private` conforme necessário.
