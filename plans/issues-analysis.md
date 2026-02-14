# Relatório de Análise - Doc2Learn

## Sumário Executivo

Foram identificados **12 problemas** distribuídos em 4 categorias que impedem o funcionamento adequado da aplicação em produção.

---

## 1. Sistema de PDFs

### Problema 1.1: PDFs não carregam em produção (CRÍTICO)

**Descrição:** O visualizador de PDFs reporta que o arquivo não existe quando acessado em produção.

**Localização:**
- [`server/routes/documents.ts:100-158`](server/routes/documents.ts:100) - Upload salva arquivo localmente
- [`server/routes/documents.ts:359-393`](server/routes/documents.ts:359) - Rota de servir arquivo
- [`server/middleware/upload.ts`](server/middleware/upload.ts) - Configuração de upload

**Causa Provável:**
O sistema usa armazenamento local (`uploads/` folder) que é **efêmero no Render**. A cada deploy, os arquivos são perdidos. O Cloudinary foi implementado mas não está sendo usado para PDFs.

**Solução Recomendada:**
1. Migrar upload de PDFs para Cloudinary
2. Atualizar rota de upload para usar `cloudinary.uploader.upload()`
3. Armazenar `cloudinaryUrl` em vez de `filePath` no banco
4. Servir PDFs diretamente da URL do Cloudinary

---

### Problema 1.2: Chat não contextualiza com página atual (ALTA PRIORIDADE)

**Descrição:** O chat sobre PDFs não identifica a página atualmente visualizada pelo usuário para contextualizar a resposta.

**Localização:**
- [`src/pages/pdf-viewer.tsx:121-160`](src/pages/pdf-viewer.tsx:121) - `handleSendMessage()` não envia `pageContent`
- [`src/components/viewer/PDFViewer.tsx:14`](src/components/viewer/PDFViewer.tsx:14) - `onPageChange` callback existe mas não é usado
- [`server/routes/ai.ts:88`](server/routes/ai.ts:88) - Backend espera `pageContent`

**Causa Provável:**
O `PDFViewer` tem callback `onPageChange` mas o `pdf-viewer.tsx` não:
1. Rastreia a página atual
2. Extrai o texto da página via PDF.js
3. Envia para a API de chat

**Solução Recomendada:**
1. Adicionar estado `currentPage` e `pageTexts` no `pdf-viewer.tsx`
2. Usar `pdfjs` para extrair texto de cada página
3. Implementar callback `onPageChange` para atualizar página atual
4. Enviar `pageContent` com o texto da página atual no chat

---

## 2. Área de Configurações (Settings)

### Problema 2.1: Profile marcado como "Coming Soon"

**Descrição:** A página de perfil do usuário está desabilitada.

**Localização:** [`src/pages/settings.tsx:14-19`](src/pages/settings.tsx:14)

**Causa Provável:** Funcionalidade não implementada.

**Solução Recomendada:**
Implementar página de perfil com:
- Edição de nome
- Alteração de email
- Upload de avatar (opcional)

Ou remover o card se não for prioridade.

---

### Problema 2.2: Security marcado como "Coming Soon"

**Descrição:** A página de segurança está desabilitada.

**Localização:** [`src/pages/settings.tsx:20-27`](src/pages/settings.tsx:20)

**Causa Provável:** Funcionalidade não implementada.

**Solução Recomendada:**
Implementar página de segurança com:
- Alteração de senha
- Gerenciamento de sessões ativas
- Autenticação de dois fatores (opcional)

Ou remover o card se não for prioridade.

---

## 3. Internacionalização e Idioma

### Problema 3.1: Prompts de IA em inglês (ALTA PRIORIDADE)

**Descrição:** Os prompts do sistema estão em inglês, fazendo a IA gerar conteúdo em inglês.

**Localização:** [`server/lib/prompts.ts:152-187`](server/lib/prompts.ts:152)

**Causa Provável:** Prompts hardcoded em inglês sem instrução de idioma.

**Solução Recomendada:**
Adicionar instrução explícita de idioma nos prompts:
```typescript
system: `You are an expert educator AI assistant.
IMPORTANT: Generate ALL content in Portuguese (Brazilian Portuguese).
All summaries, glossaries, flashcards, and quizzes must be in Portuguese.
...`
```

---

### Problema 3.2: Interface com idioma misto

**Descrição:** Partes da interface estão em português e partes em inglês.

**Localização:** Múltiplos arquivos em `src/pages/` e `src/components/`

**Exemplos:**
- "Welcome back" vs "Bem-vindo"
- "Settings" vs "Configurações"
- "Coming Soon" vs "Em breve"

**Solução Recomendada:**
1. Padronizar para português brasileiro
2. Considerar uso de biblioteca de i18n (react-i18next) se suporte multi-idioma for necessário

---

### Problema 3.3: Quiz gerado com questões mistas

**Descrição:** Quiz contém questões em português e inglês no mesmo documento.

**Localização:** Derivado do Problema 3.1

**Solução Recomendada:** Corrigir prompts conforme Problema 3.1.

---

## 4. Estabilidade Geral

### Problema 4.1: Rota `/learn` pode não estar funcionando

**Status:** CORRIGIDO - Página índice criada em [`src/pages/learning-index.tsx`](src/pages/learning-index.tsx)

---

### Problema 4.2: Layout do PDF Viewer aninhado

**Status:** CORRIGIDO - Rota movida para fora do AppShell em [`src/App.tsx`](src/App.tsx)

---

### Problema 4.3: Autenticação cross-origin

**Status:** CORRIGIDO - Cookies configurados com `SameSite=None; Secure=true` em [`server/routes/auth.ts`](server/routes/auth.ts)

---

### Problema 4.4: BYOK implementado

**Status:** CORRIGIDO - Sistema de criptografia AES-256-GCM implementado em [`server/lib/encryption.ts`](server/lib/encryption.ts)

---

## Priorização de Correções

| Prioridade | Problema | Impacto | Esforço |
|------------|----------|---------|---------|
| 🔴 CRÍTICO | 1.1 PDFs não carregam | Alto | Médio |
| 🟠 ALTA | 1.2 Chat sem contexto | Médio | Médio |
| 🟠 ALTA | 3.1 Prompts em inglês | Médio | Baixo |
| 🟡 MÉDIA | 3.2 Interface mista | Baixo | Alto |
| 🟢 BAIXA | 2.1 Profile Coming Soon | Baixo | Médio |
| 🟢 BAIXA | 2.2 Security Coming Soon | Baixo | Médio |

---

## Plano de Ação Recomendado

### Fase 1: Correções Críticas
1. Migrar PDFs para Cloudinary
2. Adicionar instrução de português nos prompts

### Fase 2: Melhorias de UX
3. Implementar contexto de página no chat
4. Padronizar idioma da interface

### Fase 3: Funcionalidades Faltantes
5. Implementar página de Profile
6. Implementar página de Security
