# Plano de Correções - Doc2Learn

## Problemas Identificados

### 1. Página de Chat
- **Problema:** Não existe rota `/chat` no App.tsx
- **Solução:** Criar página dedicada `ChatPage.tsx` e adicionar rota

### 2. Página de Learning Experience
- **Problema:** É apenas um placeholder "under construction"
- **Solução:** Implementar página funcional que mostra:
  - Documento carregado
  - Tabs para Quiz, Glossário, Resumo, Exercícios
  - Navegação entre conteúdos

### 3. PDF Viewer Real
- **Problema:** O `pdf-viewer.tsx` atual mostra apenas texto extraído, não o PDF real
- **Solução:** Integrar `react-pdf` para visualização real com:
  - Navegação por páginas
  - Zoom
  - Seleção de texto
  - Miniaturas (opcional)

---

## Ficheiros a Criar/Modificar

### Criar
1. `src/pages/ChatPage.tsx` - Página dedicada para chat com IA

### Modificar
1. `src/App.tsx` - Adicionar rota `/chat`
2. `src/pages/learning-experience.tsx` - Implementar funcionalmente
3. `src/pages/pdf-viewer.tsx` - Integrar react-pdf real
4. `src/components/viewer/PDFViewer.tsx` - Corrigir e melhorar

---

## Implementação

### Fase 1: Chat Page
```tsx
// src/pages/ChatPage.tsx
- Interface para chat com IA
- Histórico de mensagens
- Input para perguntas
- Contexto de documento (opcional)
```

### Fase 2: Learning Experience
```tsx
// src/pages/learning-experience.tsx
- Carregar documento por ID
- Mostrar tabs: Quiz, Glossário, Resumo, Exercícios
- Carregar conteúdo de cada tab
- Navegação entre tabs
```

### Fase 3: PDF Viewer Real
```tsx
// src/pages/pdf-viewer.tsx
- Usar react-pdf para renderizar PDF real
- Controles de página (anterior/próxima)
- Controles de zoom (+/-)
- Seleção de texto para AI
- Sidebar com AI Panel
```

---

## Rotas Atualizadas

```tsx
// App.tsx
<Route path="chat" element={<ChatPage />} />
<Route path="learn/:experienceId" element={<LearningExperiencePage />} />
<Route path="documents/:id/view" element={<PDFViewerPage />} />
```

---

## Dependências Necessárias

```bash
npm install react-pdf pdfjs-dist
```

**Nota:** O utilizador já instalou as dependências.

---

## Próximos Passos

1. Implementar ChatPage
2. Implementar LearningExperiencePage funcional
3. Integrar react-pdf no PDFViewerPage
4. Testar todas as funcionalidades
