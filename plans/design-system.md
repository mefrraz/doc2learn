# Doc2Learn - Design System

## 🎨 Filosofia de Design

**Princípios:**
- **Minimalismo Técnico** - Interface limpa sem distrações
- **Hierarquia Visual Clara** - Conteúdo em primeiro plano
- **Consistência** - Padrões uniformes em toda a aplicação
- **Acessibilidade** - Contraste adequado e navegação intuitiva

---

## 🎨 Paleta de Cores

### Cores Primárias (Neutras)
```css
--background: #FAFAFA          /* Fundo principal - quase branco */
--background-secondary: #F5F5F5 /* Fundo secundário - cinza muito claro */
--surface: #FFFFFF             /* Cards e superfícies */
--border: #E5E5E5              /* Bordas sutis */
```

### Cores de Texto
```css
--text-primary: #171717        /* Texto principal - quase preto */
--text-secondary: #525252      /* Texto secundário - cinza escuro */
--text-muted: #737373          /* Texto desabilitado/legendas */
--text-inverse: #FFFFFF        /* Texto sobre fundos escuros */
```

### Cores de Ação (Uso Moderado)
```css
--accent: #2563EB              /* Azul - links, botões primários */
--accent-hover: #1D4ED8        /* Azul escuro - hover */
--success: #16A34A             /* Verde - sucesso/correto */
--error: #DC2626               /* Vermelho - erro/incorreto */
--warning: #CA8A04             /* Amarelo - aviso */
```

### Modo Escuro
```css
--background: #0A0A0A
--background-secondary: #171717
--surface: #1F1F1F
--border: #2E2E2E
--text-primary: #FAFAFA
--text-secondary: #A3A3A3
--text-muted: #737373
```

---

## 📝 Tipografia

### Família de Fonte
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Escala Tipográfica
```css
/* Títulos */
--text-h1: 2rem;      /* 32px - Título principal */
--text-h2: 1.5rem;    /* 24px - Título de secção */
--text-h3: 1.25rem;   /* 20px - Título de card */
--text-h4: 1rem;      /* 16px - Título pequeno */

/* Corpo */
--text-body: 0.875rem;    /* 14px - Texto normal */
--text-small: 0.75rem;    /* 12px - Texto pequeno */
--text-caption: 0.625rem; /* 10px - Legendas */

/* Pesos */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Line Height
```css
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

---

## 📐 Espaçamento

### Sistema de 4px
```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
```

---

## 🔲 Componentes

### Cards
```css
/* Card Base */
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: var(--space-4);
}

/* Card Elevado (apenas quando necessário) */
.card-elevated {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
```

### Botões
```css
/* Botão Primário */
.btn-primary {
  background: var(--accent);
  color: var(--text-inverse);
  padding: var(--space-2) var(--space-4);
  border-radius: 6px;
  font-weight: var(--font-medium);
  font-size: var(--text-body);
}

/* Botão Secundário */
.btn-secondary {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-primary);
}

/* Botão Ghost */
.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
}
```

### Inputs
```css
.input {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-body);
  color: var(--text-primary);
}

.input:focus {
  border-color: var(--accent);
  outline: none;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}
```

---

## 📄 Visualizador de PDF

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Header: Título do Documento                    [Controlos] │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────┐ ┌─────────────────────┐ │
│ │                                 │ │ TOOLS               │ │
│ │      DOCUMENTO                  │ │ ┌─────────────────┐ │ │
│ │      (fundo branco puro)        │ │ │ Summarize       │ │ │
│ │      (texto preto puro)         │ │ │ Generate Ex.    │ │ │
│ │      (sem sombras)              │ │ └─────────────────┘ │ │
│ │      (borda sutil)              │ │                     │ │
│ │                                 │ │ CHAT                │ │
│ │                                 │ │ ┌─────────────────┐ │ │
│ │                                 │ │ │ Messages...     │ │ │
│ │                                 │ │ │                 │ │ │
│ │                                 │ │ │ [input]         │ │ │
│ │  ◀  1/25  ▶                    │ │ └─────────────────┘ │ │
│ └─────────────────────────────────┘ └─────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Footer: Navegação de páginas                               │
└─────────────────────────────────────────────────────────────┘
```

### Estilo do Documento
```css
.document-viewer {
  background: #FFFFFF;
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 48px;
  max-width: 816px; /* Largura A4 */
  margin: 0 auto;
  font-family: 'Times New Roman', serif; /* Fonte serifada para documentos */
  font-size: 12pt;
  line-height: 1.6;
  color: #000000;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* Modo escuro - documento mantém fundo branco */
@media (prefers-color-scheme: dark) {
  .document-viewer {
    background: #FFFFFF;
    color: #000000;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  }
}
```

---

## 📚 Glossário

### Layout Minimalista
```
┌─────────────────────────────────────────────────────────────┐
│  Glossary                                    42 terms       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔍 Search terms...                              [×] │   │
│  └─────────────────────────────────────────────────────┘   │
│  [All] [A] [B] [C] [D] [E] [F] [G] [H] [I] [J] [K] [L]...  │
├─────────────────────────────────────────────────────────────┤
│  A                                                          │
│  ─────────────────────────────────────────────────────────  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Algorithm                                           │   │
│  │ A step-by-step procedure for solving a problem...   │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ API                                                 │   │
│  │ Application Programming Interface; a set of...      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  B                                                          │
│  ─────────────────────────────────────────────────────────  │
│  ...                                                        │
└─────────────────────────────────────────────────────────────┘
```

### Estilo dos Cards
```css
.glossary-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: var(--space-4);
  transition: border-color 0.15s ease;
}

.glossary-card:hover {
  border-color: var(--text-muted);
}

.glossary-term {
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  font-size: var(--text-body);
}

.glossary-definition {
  color: var(--text-secondary);
  font-size: var(--text-small);
  line-height: var(--leading-relaxed);
  margin-top: var(--space-2);
}

/* Sem cores vibrantes, sem gradientes */
```

---

## 💬 Chat Assistente

### Estilo
```css
.chat-container {
  background: var(--background-secondary);
  border-left: 1px solid var(--border);
}

.chat-message-user {
  background: var(--accent);
  color: var(--text-inverse);
  border-radius: 12px 12px 4px 12px;
}

.chat-message-assistant {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px 12px 12px 4px;
}
```

---

## ✅ Checklist de Implementação

1. [ ] Atualizar `tailwind.config.js` com novas variáveis
2. [ ] Redesenhar `PDFViewerPage` com fidelidade de documento
3. [ ] Redesenhar `GlossaryPage` com estética minimalista
4. [ ] Corrigir renderização markdown nas respostas da IA
5. [ ] Aplicar Design System consistente em toda a aplicação

---

## 🔄 Próximos Passos

Após aprovação deste Design System, procederei à implementação:
1. Atualização do Tailwind config
2. Redesign do PDFViewerPage
3. Redesign do GlossaryPage
4. Correção do renderizador markdown
