# Doc2Learn - Plano de Nova Interface

## 🎯 Visão

Transformar o Doc2Learn numa aplicação de aprendizagem moderna, focada em:
- **Leitura fluida** de documentos PDF e Markdown
- **Experiência premium** com tipografia e animações cuidadas
- **IA integrada** como assistente de aprendizagem

## 📐 Arquitetura da Interface

### Layout Principal

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           TOP BAR (minimal)                              │
│  [Logo] Doc2Learn          [🔍 Search...]        [☀️/🌙] [👤 Profile]   │
├──────────────┬──────────────────────────────────────────────────────────┤
│              │                                                           │
│   SIDEBAR    │                    MAIN CONTENT                           │
│   (240px)    │                  (flexible width)                         │
│              │                                                           │
│  ┌────────┐  │  ┌─────────────────────────────────────────────────────┐  │
│  │ 📁 Docs │  │  │                                                     │  │
│  ├────────┤  │  │                                                     │  │
│  │ • Doc 1│  │  │              DOCUMENT VIEWER                         │  │
│  │ • Doc 2│  │  │                                                     │  │
│  │ • Doc 3│  │  │        (PDF ou Markdown renderizado)                 │  │
│  └────────┘  │  │                                                     │  │
│              │  │                                                     │  │
│  ┌────────┐  │  └─────────────────────────────────────────────────────┘  │
│  │ ⚡ AI   │  │                                                           │
│  │ Chat   │  │  ┌─────────────────────────────────────────────────────┐  │
│  └────────┘  │  │              AI ASSISTANT PANEL                       │  │
│              │  │              (collapsible, right side)                │  │
│  ┌────────┐  │  │                                                     │  │
│  │ 📊 Learn│  │  │  [Chat] [Summarize] [Quiz] [Exercises]              │  │
│  │ • Quiz │  │  │                                                     │  │
│  │ • Gloss│  │  └─────────────────────────────────────────────────────┘  │
│  └────────┘  │                                                           │
│              │                                                           │
├──────────────┴──────────────────────────────────────────────────────────┤
│                         BOTTOM BAR (optional)                            │
│  [📄 PDF] [📝 Notes] [🎯 Quiz] [📚 Glossary] [⚙️ Settings]              │
└─────────────────────────────────────────────────────────────────────────┘
```

### Modos de Visualização

#### 1. PDF Viewer (Real)
```
┌─────────────────────────────────────────────────────────────┐
│  [◀ Prev]  Page 1 of 10  [Next ▶]    [🔍-] [100%] [🔍+]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│    ┌─────────────────────────────────────────────────┐     │
│    │                                                  │     │
│    │              PDF PAGE RENDERED                   │     │
│    │                                                  │     │
│    │    (renderizado nativamente com react-pdf)       │     │
│    │                                                  │     │
│    │    - Zoom in/out                                 │     │
│    │    - Seleção de texto                            │     │
│    │    - Pesquisa no documento                       │     │
│    │    - Miniaturas de páginas                       │     │
│    │                                                  │     │
│    └─────────────────────────────────────────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 2. Markdown Reader
```
┌─────────────────────────────────────────────────────────────┐
│  [Edit] [View] [Split]                    [☀️ Reader Mode]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│    # Document Title                                         │
│                                                             │
│    Lorem ipsum dolor sit amet, consectetur adipiscing      │
│    elit. Sed do eiusmod tempor incididunt ut labore.       │
│                                                             │
│    ## Section Heading                                       │
│                                                             │
│    - List item one                                          │
│    - List item two                                          │
│    - List item three                                        │
│                                                             │
│    ```python                                                │
│    def hello_world():                                       │
│        print("Hello, World!")                               │
│    ```                                                      │
│                                                             │
│    > Blockquote with important information                  │
│                                                             │
│    | Column 1 | Column 2 | Column 3 |                       │
│    |----------|----------|----------|                       │
│    | Data     | Data     | Data     |                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 3. AI Assistant Panel
```
┌─────────────────────────────────────┐
│  ⚡ AI Assistant              [×]   │
├─────────────────────────────────────┤
│                                     │
│  [Chat] [Summarize] [Quiz] [More]   │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  💬 Chat                            │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ User: What is this about?   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ AI: This document covers... │   │
│  │                             │   │
│  │ The main topics are:        │   │
│  │ 1. Introduction to...       │   │
│  │ 2. Core concepts...         │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Ask a question...      [➤] │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

## 🎨 Design System Atualizado

### Cores (Tema Claro)

| Token | Valor | Uso |
|-------|-------|-----|
| `--bg-primary` | `#FFFBF5` | Fundo principal (warm white) |
| `--bg-secondary` | `#FFFFFF` | Cards, sidebars |
| `--bg-tertiary` | `#F5F0EB` | Hover states |
| `--text-primary` | `#1A1A1A` | Texto principal |
| `--text-secondary` | `#666666` | Texto secundário |
| `--text-muted` | `#999999` | Texto discreto |
| `--accent` | `#4F46E5` | Links, botões |
| `--accent-light` | `#EEF2FF` | Backgrounds de destaque |
| `--border` | `#E5E0DB` | Bordas |
| `--success` | `#10B981` | Sucesso |
| `--error` | `#EF4444` | Erro |

### Cores (Tema Escuro)

| Token | Valor | Uso |
|-------|-------|-----|
| `--bg-primary` | `#0F0F0F` | Fundo principal |
| `--bg-secondary` | `#1A1A1A` | Cards, sidebars |
| `--bg-tertiary` | `#252525` | Hover states |
| `--text-primary` | `#FAFAFA` | Texto principal |
| `--text-secondary` | `#A0A0A0` | Texto secundário |
| `--text-muted` | `#666666` | Texto discreto |
| `--accent` | `#6366F1` | Links, botões |
| `--accent-light` | `#1E1B4B` | Backgrounds de destaque |

### Tipografia

| Elemento | Fonte | Tamanho | Peso |
|----------|-------|---------|------|
| Headings | `Inter` | 24-32px | 600-700 |
| Body | `Inter` | 16px | 400 |
| Reader Content | `Merriweather` | 18px | 400 |
| Code | `JetBrains Mono` | 14px | 400 |
| UI Labels | `Inter` | 12-14px | 500 |

### Espaçamentos

| Token | Valor | Uso |
|-------|-------|-----|
| `--space-xs` | 4px | Icon padding |
| `--space-sm` | 8px | Button padding |
| `--space-md` | 16px | Card padding |
| `--space-lg` | 24px | Section padding |
| `--space-xl` | 48px | Page margins |

### Glassmorphism (Sutil)

```css
.glass-panel {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.05);
}
```

---

## 📦 Dependências Necessárias

### PDF Viewer Real

```bash
npm install react-pdf pdfjs-dist
```

**Configuração necessária:**
- Copiar worker do pdfjs-dist para public/
- Configurar CORS para PDFs externos

### Markdown Renderer

```bash
npm install react-markdown remark-gfm rehype-highlight rehype-raw
```

**Features:**
- GitHub Flavored Markdown (tabelas, checkboxes, strikethrough)
- Syntax highlighting para código
- HTML inline seguro

### Ícones e Animações

```bash
npm install @heroicons/react framer-motion
```

**Nota:** `framer-motion` já está instalado

### Utilitários

```bash
npm install clsx tailwind-merge
```

**Nota:** `clsx` já está instalado como dependência do tailwind-merge

---

## 🗂️ Estrutura de Ficheiros Atualizada

```
src/
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx          # Layout principal
│   │   ├── Sidebar.tsx           # Sidebar com navegação
│   │   ├── TopBar.tsx            # Barra superior
│   │   └── BottomBar.tsx         # Barra inferior (opcional)
│   │
│   ├── viewer/
│   │   ├── PDFViewer.tsx         # Visualizador PDF real
│   │   ├── PDFControls.tsx       # Controles de zoom/páginas
│   │   ├── PDFThumbnails.tsx     # Miniaturas de páginas
│   │   ├── MarkdownViewer.tsx    # Renderizador Markdown
│   │   └── MarkdownEditor.tsx    # Editor Markdown (opcional)
│   │
│   ├── ai/
│   │   ├── AIPanel.tsx           # Painel lateral de IA
│   │   ├── AIChat.tsx            # Chat com IA
│   │   ├── AISummarize.tsx       # Resumo automático
│   │   └── AIQuiz.tsx            # Quiz gerado por IA
│   │
│   └── ui/
│       ├── Button.tsx            # Botão (existente)
│       ├── Card.tsx              # Card (existente)
│       ├── Input.tsx             # Input (existente)
│       ├── GlassPanel.tsx        # Painel glassmorphism
│       ├── SearchModal.tsx       # Modal de pesquisa
│       └── ThemeToggle.tsx       # Toggle dark/light
│
├── pages/
│   ├── Dashboard.tsx             # Dashboard renovado
│   ├── DocumentPage.tsx          # Página de documento unificada
│   ├── SettingsPage.tsx          # Definições
│   └── auth/
│       ├── LoginPage.tsx
│       └── RegisterPage.tsx
│
├── hooks/
│   ├── useTheme.ts               # Hook para tema
│   ├── usePDF.ts                 # Hook para PDF
│   └── useAI.ts                  # Hook para IA
│
├── lib/
│   ├── pdf/
│   │   └── config.ts             # Configuração do pdfjs
│   └── markdown/
│       └── components.tsx        # Componentes customizados para MD
│
└── styles/
    ├── globals.css               # Estilos globais
    ├── pdf.css                   # Estilos do PDF viewer
    └── markdown.css              # Estilos do markdown
```

---

## 🔄 Fluxo de Implementação

### Fase 1: Fundação (2-3 horas)

1. **Instalar dependências**
   ```bash
   npm install react-pdf pdfjs-dist react-markdown remark-gfm rehype-highlight
   ```

2. **Configurar pdfjs-dist**
   - Copiar worker para `public/pdf.worker.min.js`
   - Configurar em `src/lib/pdf/config.ts`

3. **Atualizar Design System**
   - Novas variáveis CSS em `src/index.css`
   - Atualizar `tailwind.config.js`

### Fase 2: Layout (2-3 horas)

1. **Criar novos componentes de layout**
   - `AppShell.tsx` - Layout principal com sidebar
   - `Sidebar.tsx` - Navegação lateral
   - `TopBar.tsx` - Barra superior minimal

2. **Implementar tema dark/light**
   - `ThemeToggle.tsx`
   - Persistência em localStorage

### Fase 3: PDF Viewer Real (3-4 horas)

1. **Criar PDFViewer component**
   - Renderização de páginas com `react-pdf`
   - Controles de zoom
   - Navegação por páginas

2. **Adicionar features**
   - Seleção de texto
   - Miniaturas de páginas
   - Modo fullscreen

### Fase 4: Markdown Reader (2-3 horas)

1. **Criar MarkdownViewer component**
   - Renderização com `react-markdown`
   - Syntax highlighting
   - Componentes customizados

2. **Estilizar markdown**
   - Tipografia Merriweather
   - Tabelas, blockquotes, código

### Fase 5: AI Panel (2-3 horas)

1. **Criar AIPanel component**
   - Painel lateral colapsável
   - Tabs para Chat, Summarize, Quiz

2. **Integrar com backend existente**
   - Usar endpoints `/api/ai/*`

### Fase 6: Páginas Finais (2-3 horas)

1. **Renovar Dashboard**
   - Grid de documentos com preview
   - Ações rápidas

2. **Criar DocumentPage unificada**
   - Tabs para PDF/Markdown/Notes
   - AI Panel integrado

---

## 🎯 Componentes Prioritários

### 1. PDFViewer (Crítico)

```tsx
// src/components/viewer/PDFViewer.tsx
interface PDFViewerProps {
  file: string | Blob
  onTextSelect?: (text: string) => void
  onPageChange?: (page: number) => void
}

// Features:
// - Renderização nativa de PDF
// - Zoom (50% - 200%)
// - Navegação por páginas
// - Seleção de texto
// - Miniaturas (opcional)
```

### 2. MarkdownViewer (Crítico)

```tsx
// src/components/viewer/MarkdownViewer.tsx
interface MarkdownViewerProps {
  content: string
  className?: string
}

// Features:
// - GitHub Flavored Markdown
// - Syntax highlighting
// - Tabelas
// - Blockquotes estilizados
// - Links externos (target="_blank")
```

### 3. AIPanel (Importante)

```tsx
// src/components/ai/AIPanel.tsx
interface AIPanelProps {
  documentId: string
  selectedText?: string
  onClose?: () => void
}

// Features:
// - Chat com contexto
// - Resumir seleção
// - Gerar quiz
// - Explicar conceito
```

---

## 📱 Responsividade

| Breakpoint | Layout |
|------------|--------|
| Mobile (<640px) | Sidebar escondida, drawer |
| Tablet (640-1024px) | Sidebar colapsada (ícones) |
| Desktop (>1024px) | Sidebar expandida |

---

## ✅ Checklist de Implementação

### Fase 1: Fundação
- [ ] Instalar dependências
- [ ] Configurar pdfjs-dist worker
- [ ] Atualizar variáveis CSS
- [ ] Atualizar Tailwind config

### Fase 2: Layout
- [ ] Criar AppShell
- [ ] Criar Sidebar
- [ ] Criar TopBar
- [ ] Implementar ThemeToggle

### Fase 3: PDF Viewer
- [ ] Criar PDFViewer base
- [ ] Implementar controles de zoom
- [ ] Implementar navegação de páginas
- [ ] Adicionar seleção de texto

### Fase 4: Markdown
- [ ] Criar MarkdownViewer
- [ ] Configurar remark-gfm
- [ ] Configurar rehype-highlight
- [ ] Estilizar componentes

### Fase 5: AI Panel
- [ ] Criar AIPanel container
- [ ] Implementar AIChat
- [ ] Implementar AISummarize
- [ ] Integrar com backend

### Fase 6: Páginas
- [ ] Renovar Dashboard
- [ ] Criar DocumentPage
- [ ] Atualizar rotas

---

## 🚀 Próximos Passos

1. **Aprovar este plano**
2. **Começar pela Fase 1** (instalar dependências e configurar)
3. **Implementar incrementalmente** com testes em cada fase

---

**Tempo estimado total:** 12-18 horas de desenvolvimento
**Complexidade:** Média
**Risco:** Baixo (backend já funcional)
