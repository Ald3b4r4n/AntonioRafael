# Portfólio — Antônio Rafael Souza Cruz de Noronha

## 📋 Sumário Executivo

Este projeto é um **portfólio profissional interativo** desenvolvido como uma Single-Page Application (SPA) moderna, construída com as mais recentes tecnologias do ecossistema React. O objetivo principal é apresentar projetos, experiências e informações de contato de forma visualmente impactante, com performance otimizada e estratégias avançadas de SEO para ranqueamento orgânico pelo nome completo "Antônio Rafael Souza Cruz de Noronha".

O portfólio destaca-se por implementar **física simulada em tempo real** para um crachá interativo (lanyard badge), **SEO dinâmico** com Schema.org JSON-LD, **funções serverless** para envio de e-mails, e **efeitos visuais sutis** que enriquecem a experiência do usuário sem comprometer a usabilidade.

---

## 🎯 Visão Geral do Projeto

### Funcionalidades Principais

1. **Navegação SPA por Tabs**: Três seções principais (Sobre Mim, Projetos e Contato) controladas por estado React, sem recarregamento de página
2. **Crachá Interativo com Física Realista**: Elemento visual único que simula um crachá pendurado por uma corda, com:
   - Movimento pendular baseado em física newtoniana
   - Alongamento elástico da corda (mola)
   - Amortecimento e efeito de quique
   - Ancoragem dinâmica ao botão "Projetos" no desktop
   - Posicionamento responsivo para mobile
   - Visível apenas na aba "Sobre Mim"
3. **Efeitos Visuais Decorativos**: Animação sutil de chuva no background que não interfere na interação
4. **SEO Dinâmico Avançado**: 
   - Meta tags geradas em tempo de execução
   - URLs canônicas dinâmicas
   - Open Graph e Twitter Cards
   - Schema.org JSON-LD (WebSite e Person)
5. **Sitemap Dinâmico**: Gerado via função serverless que detecta automaticamente o domínio da requisição
6. **Sistema de Contato**: Endpoint serverless que envia e-mails via Nodemailer com configuração Gmail

---

## 🏗️ Arquitetura e Stack Tecnológica

### Tecnologias Core e Versões Específicas

#### **Frontend Framework**
- **React 19.1.1** (`^19.1.1`)
  - Biblioteca JavaScript declarativa para construção de interfaces
  - Utiliza a mais recente versão com melhorias de performance e novos hooks
  - Renderização eficiente com Virtual DOM
- **React DOM 19.1.1** (`^19.1.1`)
  - Ponte entre React e o DOM do navegador
  - Gerenciamento otimizado de atualizações de interface

#### **Build Tool e Bundler**
- **Vite 7.1.7** (`^7.1.7`)
  - Build tool de próxima geração baseado em ES Modules nativos
  - Hot Module Replacement (HMR) extremamente rápido
  - Build de produção otimizado com Rollup
  - Suporte nativo a TypeScript e JSX
- **@vitejs/plugin-react 5.0.4** (`^5.0.4`)
  - Plugin oficial para integração React + Vite
  - Suporte a Fast Refresh para desenvolvimento

#### **Animações e Física**
- **Framer Motion 12.23.22** (`^12.23.22`)
  - Biblioteca de animações declarativas para React
  - Utilizada para gestos de drag no crachá
  - Sistema de animação baseado em física
  - API `useAnimation()` para controle programático

#### **Estilização**
- **CSS Modules**
  - Escopo local automático de estilos
  - Evita conflitos de nomes de classes
  - Integração nativa com Vite
  - Arquivos `.module.css` por componente

#### **Backend Serverless**
- **Express 5.1.0** (`^5.1.0`)
  - Framework web minimalista para Node.js
  - Utilizado nas funções serverless da Vercel
- **Nodemailer 7.0.7** (`^7.0.7`)
  - Biblioteca para envio de e-mails via SMTP
  - Configurado para Gmail com App Passwords
  - Suporte a SSL/TLS e STARTTLS
- **Body Parser 2.2.0** (`^2.2.0`)
  - Middleware para parsing de requisições JSON
- **CORS 2.8.5** (`^2.8.5`)
  - Middleware para configuração de Cross-Origin Resource Sharing

#### **HTTP Client**
- **Axios 1.12.2** (`^1.12.2`)
  - Cliente HTTP baseado em Promises
  - Utilizado para comunicação com API de contato

#### **Qualidade de Código**
- **ESLint 9.36.0** (`^9.36.0`)
  - Linter moderno para JavaScript/JSX
  - Configuração flat config (nova sintaxe)
- **@eslint/js 9.36.0** (`^9.36.0`)
  - Configurações recomendadas oficiais
- **eslint-plugin-react-hooks 5.2.0** (`^5.2.0`)
  - Regras para validar hooks do React
- **eslint-plugin-react-refresh 0.4.22** (`^0.4.22`)
  - Validação de componentes compatíveis com Fast Refresh
- **globals 16.4.0** (`^16.4.0`)
  - Definições de variáveis globais para ESLint

#### **TypeScript (Type Checking)**
- **@types/react 19.1.16** (`^19.1.16`)
- **@types/react-dom 19.1.9** (`^19.1.9`)
  - Definições de tipos para melhor IntelliSense e validação

---

## 📐 Estrutura do Projeto

```
portfolio/
├── api/                          # Funções Serverless (Vercel Functions)
│   ├── contact.mjs               # POST /api/contact — envio de e-mails
│   ├── health.mjs                # GET /api/health — health check
│   └── sitemap.mjs               # GET /api/sitemap — sitemap dinâmico XML
│
├── public/                       # Arquivos estáticos servidos diretamente
│   ├── manifest.webmanifest      # PWA manifest
│   ├── robots.txt                # Diretivas para crawlers (aponta para /api/sitemap)
│   └── sitemap.xml               # Sitemap estático de fallback
│
├── src/                          # Código-fonte da aplicação
│   ├── App.jsx                   # Componente raiz — gerencia navegação e renderização condicional
│   │
│   ├── components/               # Componentes reutilizáveis
│   │   ├── Nav.jsx               # Header de navegação com tabs
│   │   ├── Nav.module.css        # Estilos do Nav
│   │   ├── LanyardBadge.jsx      # Crachá com física simulada
│   │   ├── LanyardBadge.module.css
│   │   ├── SEO.jsx               # Componente de SEO dinâmico
│   │   ├── RainCanvas.jsx        # Efeito de chuva decorativo
│   │   └── RainCanvas.module.css
│   │
│   ├── pages/                    # Páginas/Seções da SPA
│   │   ├── About.jsx             # Página "Sobre Mim"
│   │   ├── About.module.css
│   │   ├── Projects.jsx          # Página "Projetos"
│   │   ├── Projects.module.css
│   │   ├── Contact.jsx           # Página "Contato"
│   │   └── Contact.module.css
│   │
│   ├── main.jsx                  # Entry point — renderiza App no DOM
│   └── index.css                 # Estilos globais e variáveis CSS
│
├── index.html                    # HTML base com meta tags de fallback
├── package.json                  # Dependências e scripts npm
├── vite.config.js                # Configuração do Vite
├── eslint.config.js              # Configuração do ESLint (flat config)
└── README.md                     # Este arquivo
```

---

## 🔬 Teoria e Implementações Técnicas Avançadas

### 1. Física Simulada do Crachá (LanyardBadge.jsx)

O componente `LanyardBadge` implementa uma **simulação de física em tempo real** sem dependências externas de motores físicos, utilizando princípios de mecânica clássica.

#### **Teoria Física Aplicada**

**a) Movimento Pendular (Pêndulo Simples)**
- Baseado na equação diferencial do pêndulo: `θ'' = -(g/L) * sin(θ)`
- Onde:
  - `θ` = ângulo de deslocamento da vertical
  - `g` = aceleração gravitacional (simulada)
  - `L` = comprimento da corda
- Implementação simplificada usando aproximação de pequenos ângulos e integração de Euler

**b) Sistema Massa-Mola (Alongamento da Corda)**
- Lei de Hooke: `F = -k * x`
- Onde:
  - `k` = constante elástica da mola
  - `x` = deslocamento da posição de equilíbrio
- Simula o alongamento/compressão da corda quando o crachá é arrastado

**c) Amortecimento**
- Força de amortecimento proporcional à velocidade: `F_damp = -c * v`
- Previne oscilações infinitas e torna o movimento mais natural

**d) Efeito de Quique**
- Quando o crachá atinge limites verticais, a velocidade é invertida com fator de restituição < 1
- Simula perda de energia em colisões

#### **Implementação Técnica**

```javascript
// Pseudocódigo simplificado da física
function runPhysics() {
  const step = () => {
    // 1. Calcular forças
    const gravityTorque = -(g / ropeLength) * Math.sin(angle);
    const dampingTorque = -damping * angularVelocity;
    
    // 2. Atualizar velocidade angular
    angularVelocity += (gravityTorque + dampingTorque) * dt;
    
    // 3. Atualizar ângulo
    angle += angularVelocity * dt;
    
    // 4. Calcular alongamento da corda (mola)
    const springForce = -springK * (currentLength - restLength);
    stretchVelocity += springForce * dt;
    currentLength += stretchVelocity * dt;
    
    // 5. Aplicar limites e quique
    if (badgeY > maxY) {
      badgeY = maxY;
      velocity.y *= -restitution; // Quique
    }
    
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
```

#### **Desafios Superados**
- **Estabilidade numérica**: Ajuste fino de constantes (k, damping) para evitar explosões numéricas
- **Ancoragem dinâmica**: Cálculo em tempo real da posição do botão "Projetos" com `getBoundingClientRect()`
- **Responsividade**: Detecção de breakpoints para alternar entre ancoragem ao botão (desktop) e topo da página (mobile)
- **Drag natural**: Conversão de coordenadas de mouse/touch para forças aplicadas ao sistema físico

---

### 2. SEO Dinâmico com Schema.org (SEO.jsx)

#### **Teoria de SEO Moderno**

**a) Meta Tags Dinâmicas**
- Atualização do `<head>` em tempo de execução via JavaScript
- Essencial para SPAs onde o conteúdo muda sem recarregar a página

**b) Canonical URLs**
- Previne conteúdo duplicado
- Indica aos motores de busca a URL preferencial

**c) Open Graph Protocol**
- Protocolo criado pelo Facebook para controlar como URLs são exibidas em redes sociais
- Tags `og:title`, `og:description`, `og:image`, etc.

**d) Twitter Cards**
- Similar ao Open Graph, específico para Twitter
- Permite cards visuais ricos ao compartilhar links

**e) Schema.org JSON-LD**
- Structured Data que ajuda motores de busca a entender o conteúdo
- Tipos implementados:
  - **WebSite**: Define o site como entidade
  - **Person**: Define o autor com nome completo, profissão e perfis sociais
- Formato JSON-LD preferido por ser mais fácil de manter que microdata

#### **Implementação Técnica**

```javascript
// Funções utilitárias para manipulação do DOM
function upsertMetaByName(name, content) {
  // Busca ou cria tag <meta name="...">
  let el = document.head.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

// JSON-LD para Person
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${baseUrl}/#person`,
  "name": "Antônio Rafael Souza Cruz de Noronha",
  "jobTitle": "Full Stack Developer",
  "url": baseUrl,
  "sameAs": [
    "https://github.com/Ald3b4r4n",
    "https://www.linkedin.com/in/antonio-rafael-souza-cruz-de-noronha-249539111/",
    "https://wa.me/5561982887294"
  ]
};
```

#### **Desafios Superados**
- **Detecção de Base URL**: Prioridade entre variável de ambiente (`VITE_SITE_URL`), prop e `window.location.origin`
- **Limpeza de Tags Antigas**: Sistema de marcação `data-seo-managed="true"` para identificar e atualizar apenas tags gerenciadas
- **Sincronização com React**: Uso de `useEffect` para garantir atualização quando props mudam

---

### 3. Funções Serverless (Vercel Functions)

#### **Teoria de Serverless Computing**

- **Modelo de execução**: Código executado sob demanda, sem gerenciar servidores
- **Escalabilidade automática**: Vercel provisiona recursos conforme necessário
- **Cold starts**: Primeira execução pode ter latência maior
- **Stateless**: Cada invocação é independente

#### **Implementação do Endpoint de Contato**

**Arquivo**: `api/contact.mjs`

```javascript
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // 1. Validação de método HTTP
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // 2. Configuração do transporter SMTP
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 465,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS // App Password do Gmail
    }
  });
  
  // 3. Envio do e-mail
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.CLINICA_EMAIL || process.env.EMAIL_USER,
    subject: `Contato de ${req.body.name}`,
    html: `<p><strong>Nome:</strong> ${req.body.name}</p>...`
  });
  
  res.status(200).json({ success: true });
}
```

#### **Desafios Superados**
- **Autenticação Gmail**: Configuração de App Passwords (senha de aplicativo) devido à autenticação de dois fatores
- **Configuração SSL/TLS**: Suporte a porta 465 (SSL) e 587 (STARTTLS) via variáveis de ambiente
- **Validação de entrada**: Sanitização de dados do formulário para prevenir injeção
- **CORS**: Configuração adequada para permitir requisições do frontend

---

## 🚧 Dificuldades Encontradas e Soluções Implementadas

### **1. Física do Crachá — Estabilidade e Naturalidade**

**Problema**: Implementação inicial causava oscilações infinitas ou explosões numéricas (valores tendendo ao infinito).

**Causa Raiz**: 
- Constantes de mola muito altas
- Falta de amortecimento adequado
- Integração numérica instável (timestep variável)

**Solução**:
- Ajuste fino de constantes físicas através de experimentação iterativa
- Implementação de amortecimento proporcional à velocidade
- Limitação de valores máximos para prevenir overflow
- Uso de `requestAnimationFrame` com delta time calculado para timestep consistente

---

### **2. Ancoragem Dinâmica do Crachá ao Botão "Projetos"**

**Problema**: O crachá precisava seguir a posição do botão "Projetos" mesmo quando a janela era redimensionada ou o layout mudava.

**Causa Raiz**:
- Posição do botão não é estática (depende de layout, fonte, zoom, etc.)
- Eventos de resize precisam recalcular posição

**Solução**:
```javascript
// Atualização contínua da posição de ancoragem
const updateOffset = () => {
  const anchor = document.querySelector('[data-lanyard-anchor="projects"]');
  if (anchor) {
    const rect = anchor.getBoundingClientRect();
    pivotX = rect.left + rect.width / 2;
    pivotY = rect.bottom;
  }
};

// Listeners para mudanças de layout
window.addEventListener('resize', updateOffset);
window.addEventListener('scroll', updateOffset);
```

---

### **3. SEO em SPA — Meta Tags Dinâmicas**

**Problema**: Crawlers de motores de busca tradicionalmente leem apenas o HTML inicial, não executam JavaScript.

**Causa Raiz**:
- SPAs renderizam conteúdo via JavaScript após carregamento
- Meta tags no `<head>` inicial são genéricas

**Solução**:
- **Meta tags de fallback** no `index.html` para crawlers que não executam JS
- **Atualização dinâmica** via `useEffect` para crawlers modernos (Google, Bing)
- **Pré-renderização** (futuro): Considerar Vercel's ISR ou SSR para SEO crítico
- **JSON-LD**: Structured data que crawlers modernos processam mesmo em SPAs

---

### **4. Sitemap Dinâmico com Múltiplos Domínios**

**Problema**: Sitemap precisa refletir o domínio atual (produção, staging, localhost), mas é gerado estaticamente.

**Causa Raiz**:
- Sitemap XML tradicional tem URLs hardcoded
- Não funciona bem com múltiplos ambientes

**Solução**:
```javascript
// api/sitemap.mjs
export default function handler(req, res) {
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['host'];
  const baseUrl = `${protocol}://${host}`;
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>${baseUrl}/</loc>
        <priority>1.0</priority>
      </url>
      <!-- ... outras URLs -->
    </urlset>`;
  
  res.setHeader('Content-Type', 'application/xml');
  res.status(200).send(xml);
}
```

---

### **5. Drag Gesture com Framer Motion — Direção Correta**

**Problema**: Ao arrastar o crachá, o movimento não seguia o cursor de forma natural.

**Causa Raiz**:
- Framer Motion's `onPan` fornece delta (variação), não posição absoluta
- Necessário converter delta em força aplicada ao sistema físico

**Solução**:
```javascript
const onPan = (e, info) => {
  // info.delta = variação desde último frame
  // info.offset = variação total desde início do drag
  
  // Aplicar força proporcional ao delta
  const forceX = info.delta.x * dragSensitivity;
  const forceY = info.delta.y * dragSensitivity;
  
  // Atualizar velocidades do sistema físico
  angularVelocity += calculateTorqueFromForce(forceX, forceY);
  stretchVelocity += forceY * stretchSensitivity;
};
```

---

### **6. Responsividade do Crachá — Mobile vs Desktop**

**Problema**: No mobile, o crachá ancorado ao botão cobria texto importante e era difícil de interagir.

**Causa Raiz**:
- Telas pequenas não têm espaço para elemento flutuante grande
- Touch targets precisam ser maiores que mouse targets

**Solução**:
- **Media query** para detectar mobile (`max-width: 768px`)
- **Posicionamento alternativo**: No mobile, crachá é posicionado no topo da página, centralizado
- **Escala reduzida**: Crachá menor em mobile para não dominar a tela
```css
@media (max-width: 768px) {
  .badge {
    transform: scale(0.7);
    /* Ancoragem ao topo em vez de ao botão */
  }
}
```

---

### **7. Configuração de E-mail com Gmail — App Passwords**

**Problema**: Autenticação falhava com erro "Invalid login" mesmo com credenciais corretas.

**Causa Raiz**:
- Gmail bloqueia "apps menos seguros" por padrão
- Autenticação de dois fatores (2FA) impede login direto com senha

**Solução**:
1. Ativar 2FA na conta Google
2. Gerar **App Password** específico para a aplicação
3. Usar App Password em vez da senha real no `EMAIL_PASS`
4. Documentar processo no README para futuros deploys

---

### **8. ESLint 9 — Migração para Flat Config**

**Problema**: ESLint 9 deprecou o formato `.eslintrc.js` em favor de `eslint.config.js` (flat config).

**Causa Raiz**:
- Breaking change na API de configuração
- Plugins e extends funcionam de forma diferente

**Solução**:
```javascript
// eslint.config.js (novo formato)
import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
];
```

---

## 🚀 Como Rodar Localmente

### **Pré-requisitos**

- **Node.js** 18.0.0 ou superior (recomendado: LTS 20.x)
- **npm** 9.0.0 ou superior (incluído com Node.js)
- **Git** (para clonar o repositório)

### **Instalação**

```powershell
# 1. Clonar o repositório
git clone https://github.com/Ald3b4r4n/portfolio.git
cd portfolio

# 2. Instalar dependências
npm install

# 3. Criar arquivo de variáveis de ambiente (opcional para desenvolvimento)
# Copie .env.example para .env e preencha os valores
```

### **Desenvolvimento**

```powershell
# Iniciar servidor de desenvolvimento com HMR
npm run dev

# Aplicação estará disponível em http://localhost:5173
```

### **Build de Produção**

```powershell
# Gerar build otimizado
npm run build

# Preview da build de produção
npm run preview
```

### **Lint e Qualidade de Código**

```powershell
# Executar ESLint
npm run lint

# Corrigir problemas automaticamente (quando possível)
npm run lint -- --fix
```

---

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (ou configure no painel da Vercel):

### **Frontend (Opcional)**

```env
# URL canônica do site (usada para SEO)
VITE_SITE_URL=https://seu-dominio.com

# Domínios alternativos separados por vírgula (para tag alternate)
VITE_ALT_DOMAINS=https://www.seu-dominio.com,https://outro-dominio.com
```

### **Backend / API de Contato (Obrigatório para funcionalidade de e-mail)**

```env
# Conta Gmail (deve ter App Password configurado)
EMAIL_USER=seu-email@gmail.com

# App Password gerado no Google Account
EMAIL_PASS=xxxx xxxx xxxx xxxx

# E-mail destinatário (se omitido, usa EMAIL_USER)
CLINICA_EMAIL=destinatario@example.com

# Porta SMTP (465 para SSL, 587 para STARTTLS)
EMAIL_PORT=465

# Usar SSL? ("true" para porta 465, "false" para porta 587)
EMAIL_SECURE=true
```

### **Como Gerar App Password do Gmail**

1. Acesse [Google Account Security](https://myaccount.google.com/security)
2. Ative a **Verificação em duas etapas**
3. Vá em **Senhas de app**
4. Selecione "Outro (nome personalizado)" e digite "Portfolio Contact"
5. Copie a senha gerada (16 caracteres) e use em `EMAIL_PASS`

---

## 🌐 Deploy na Vercel

### **Passo a Passo**

1. **Importar Repositório**
   - Acesse [vercel.com](https://vercel.com)
   - Clique em "New Project"
   - Importe o repositório do GitHub

2. **Configurar Build**
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Configurar Variáveis de Ambiente**
   - Vá em "Settings" → "Environment Variables"
   - Adicione todas as variáveis listadas na seção anterior
   - Marque para quais ambientes aplicar (Production, Preview, Development)

4. **Deploy**
   - Clique em "Deploy"
   - Aguarde o build completar
   - Acesse a URL gerada

5. **Verificações Pós-Deploy**
   - Teste o formulário de contato
   - Verifique o sitemap em `https://seu-dominio.vercel.app/api/sitemap`
   - Valide meta tags com [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
   - Teste Schema.org com [Google Rich Results Test](https://search.google.com/test/rich-results)

### **Funções Serverless**

As funções em `api/*.mjs` são automaticamente detectadas e deployadas como Vercel Serverless Functions:

- `POST /api/contact` — Envio de e-mails
- `GET /api/health` — Health check
- `GET /api/sitemap` — Sitemap dinâmico

---

## 📊 Performance e Otimizações

### **Métricas Alvo (Core Web Vitals)**

- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### **Otimizações Implementadas**

1. **Code Splitting**: Vite automaticamente divide o código em chunks
2. **Tree Shaking**: Remoção de código não utilizado no build
3. **Lazy Loading**: Imagens com `loading="lazy"`
4. **CSS Modules**: Estilos escopados sem overhead de runtime
5. **Minificação**: HTML, CSS e JS minificados no build
6. **Compressão**: Vercel serve arquivos com Brotli/Gzip

---

## ♿ Acessibilidade

### **Práticas Implementadas**

- **Semântica HTML**: Uso correto de tags (`<nav>`, `<main>`, `<section>`, etc.)
- **Alt Text**: Todas as imagens possuem descrições alternativas
- **Contraste**: Cores atendem WCAG AA (mínimo 4.5:1 para texto)
- **Keyboard Navigation**: Todos os elementos interativos são acessíveis via teclado
- **ARIA Labels**: Atributos ARIA onde necessário para leitores de tela
- **Focus Visible**: Indicadores visuais claros para foco de teclado

---

## 🗺️ Roadmap e Melhorias Futuras

### **Curto Prazo**

- [ ] **Roteamento com React Router**: Deep-linking para cada tab (`/`, `/projetos`, `/contato`)
- [ ] **Validação de Formulário**: Feedback em tempo real no formulário de contato
- [ ] **Rate Limiting**: Prevenir spam no endpoint de contato
- [ ] **Loading States**: Spinners e skeletons para melhor UX

### **Médio Prazo**

- [ ] **Página de Projetos Completa**: Cards detalhados com filtros por tecnologia
- [ ] **Blog Integrado**: Seção de artigos técnicos com Markdown
- [ ] **Modo Escuro**: Toggle entre temas claro/escuro
- [ ] **Internacionalização**: Suporte a inglês (i18n)

### **Longo Prazo**

- [ ] **SSR/ISR**: Migrar para Next.js para melhor SEO
- [ ] **PWA**: Service Workers para funcionalidade offline
- [ ] **Analytics**: Integração com Google Analytics 4
- [ ] **Testes Automatizados**: Jest + React Testing Library
- [ ] **CI/CD**: GitHub Actions para testes e deploy automático

---

## 🧪 Testes

### **Testes Manuais Recomendados**

1. **Física do Crachá**
   - Arrastar em diferentes direções
   - Soltar e verificar oscilação natural
   - Redimensionar janela e verificar ancoragem
   - Testar em mobile (touch)

2. **Formulário de Contato**
   - Enviar com todos os campos preenchidos
   - Testar validação de e-mail
   - Verificar recebimento do e-mail

3. **SEO**
   - Inspecionar `<head>` em cada tab
   - Validar JSON-LD no [Schema Markup Validator](https://validator.schema.org/)
   - Testar compartilhamento em redes sociais

### **Testes Automatizados (Futuro)**

```javascript
// Exemplo de teste unitário para física
describe('LanyardBadge Physics', () => {
  it('should oscillate and eventually settle', () => {
    const badge = new BadgePhysics();
    badge.applyForce(100, 0);
    
    // Simular 5 segundos
    for (let i = 0; i < 300; i++) {
      badge.step(1/60);
    }
    
    expect(badge.angularVelocity).toBeLessThan(0.01);
  });
});
```

---

## 📚 Recursos e Referências

### **Documentação Oficial**

- [React 19 Docs](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Framer Motion](https://www.framer.com/motion/)
- [Vercel Functions](https://vercel.com/docs/functions)
- [Schema.org](https://schema.org/)

### **Artigos e Tutoriais Relevantes**

- [Physics Simulation in JavaScript](https://spicyyoghurt.com/tutorials/html5-javascript-game-development/collision-detection-physics)
- [SEO for Single-Page Applications](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [CSS Modules Best Practices](https://github.com/css-modules/css-modules)

---

## 👨‍💻 Autor

**Antônio Rafael Souza Cruz de Noronha**  
Desenvolvedor Full Stack | Brasília, DF

### **Contatos**

- 🌐 **Portfólio**: [Em breve]
- 💼 **LinkedIn**: [antonio-rafael-souza-cruz-de-noronha-249539111](https://www.linkedin.com/in/antonio-rafael-souza-cruz-de-noronha-249539111/)
- 🐙 **GitHub**: [@Ald3b4r4n](https://github.com/Ald3b4r4n)
- 📱 **WhatsApp**: [+55 61 98288-7294](https://wa.me/5561982887294)

---

## 📄 Licença

Este projeto é **privado** e de propriedade de Antônio Rafael Souza Cruz de Noronha. Todos os direitos reservados.

Caso deseje abrir o código-fonte:
1. Escolha uma licença apropriada (MIT, GPL, Apache 2.0, etc.)
2. Adicione arquivo `LICENSE` na raiz do projeto
3. Altere `"private": true` para `"private": false` no `package.json`

---

## 🙏 Agradecimentos

- **Equipe React** pela biblioteca incrível
- **Evan You** e equipe Vite pelo build tool revolucionário
- **Framer** pela biblioteca de animações intuitiva
- **Vercel** pela plataforma de deploy simplificada
- **Comunidade Open Source** por todas as ferramentas utilizadas

---

**Última atualização**: Novembro 2025  
**Versão do Projeto**: 1.0.0
