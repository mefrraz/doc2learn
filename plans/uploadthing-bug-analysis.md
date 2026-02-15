# Análise de Bug: Uploadthing PDF Upload Failure

## Resumo Executivo

O upload de ficheiros PDF para o Uploadthing está a falhar com um erro de "Transport" durante o processo de upload. O erro ocorre especificamente na instanciação de `UTFile` e na chamada `utapi.uploadFiles()` no ficheiro `server/routes/documents.ts`.

## Contexto do Problema

### Arquitetura de Upload Atual

O sistema utiliza:
1. **Multer** com `memoryStorage` para receber o ficheiro PDF no backend
2. **UTFile** da biblioteca `uploadthing/server` para criar um objeto de ficheiro
3. **UTApi** para fazer o upload server-side para o Uploadthing

### Fluxo de Dados

```
Frontend → Multer (memory) → Buffer → UTFile → UTApi.uploadFiles() → Uploadthing
```

## Análise Detalhada do Erro

### Logs de Erro do Render

```json
{
  "message": "Failed to upload file",
  "logLevel": "ERROR",
  "annotations": {
    "error": {
      "request": {
        "method": "PUT",
        "url": "https://us-east-1.ingest.uploadthing.com/...",
        "body": {
          "_tag": "FormData",
          "formData": {}  // ← VAZIO! O ficheiro não está a ser anexado
        }
      },
      "reason": "Transport",
      "cause": {},
      "_tag": "RequestError"
    }
  }
}
```

### Observações Críticas

1. **FormData vazio**: O `formData: {}` indica que o conteúdo do ficheiro não está a ser corretamente anexado ao pedido HTTP
2. **Erro de Transporte**: O erro "Transport" sugere que o pedido HTTP está malformado
3. **Credenciais OK**: O URL de ingestão é gerado corretamente, indicando que as credenciais estão configuradas

## Código Problemático

### Localização: `server/routes/documents.ts` (linhas 127-129)

```typescript
// Código ATUAL (problemático)
const blob = new Blob([file.buffer], { type: file.mimetype });
const fileToUpload = new UTFile([blob as any], file.originalname);
const uploadResult = await utapi.uploadFiles([fileToUpload]);
```

### Problemas Identificados

#### 1. Tipo de Conteúdo não Especificado no UTFile

O `UTFile` aceita um terceiro parâmetro `opts` que inclui a propriedade `type`:

```typescript
// Assinatura do construtor UTFile
new UTFile(parts: BlobPart[], name: string, opts?: {
  type?: string;        // ← Não está a ser passado!
  customId?: string;
  lastModified?: number;
})
```

O tipo MIME está a ser definido no `Blob`, mas **não está a ser passado para o UTFile**. Isto pode causar problemas na serialização do ficheiro.

#### 2. Possível Problema com Buffer do Node.js

O `file.buffer` é um `Buffer` do Node.js, que pode não ser totalmente compatível com a API `Blob` do browser. Em ambientes Node.js, a criação de Blob a partir de Buffer pode ter comportamentos inesperados.

#### 3. FormData Vazio no Pedido

O erro mostra `formData: {}` vazio, o que sugere que o UTFile não está a ser corretamente serializado para o pedido multipart/form-data.

## Documentação Oficial do Uploadthing

Segundo a documentação do Uploadthing:

```typescript
// Exemplo da documentação
import { UTApi, UTFile } from "uploadthing/server";

const utapi = new UTApi();

// Construção correta do UTFile
const file = new UTFile(["foo"], "foo.txt", { customId: "foo" });
const response = await utapi.uploadFiles([file]);
```

### Parâmetros do UTFile

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `parts` | `BlobPart[]` | Sim | Partes do ficheiro (strings, Blobs, ArrayBuffers) |
| `name` | `string` | Sim | Nome do ficheiro |
| `opts.type` | `string` | Não | Tipo MIME do ficheiro |
| `opts.customId` | `string` | Não | Identificador personalizado |
| `opts.lastModified` | `number` | Não | Timestamp de última modificação |

## Soluções Propostas

### Solução 1: Passar o tipo MIME explicitamente

```typescript
const fileToUpload = new UTFile(
  [file.buffer], 
  file.originalname, 
  { type: file.mimetype }  // ← Adicionar tipo MIME
);
const uploadResult = await utapi.uploadFiles([fileToUpload]);
```

### Solução 2: Usar Uint8Array em vez de Buffer

```typescript
const uint8Array = new Uint8Array(file.buffer);
const fileToUpload = new UTFile(
  [uint8Array], 
  file.originalname, 
  { type: file.mimetype }
);
const uploadResult = await utapi.uploadFiles([fileToUpload]);
```

### Solução 3: Usar a API File nativa (Node.js 20+)

```typescript
// Node.js 20+ tem a API File global
const fileObject = new File([file.buffer], file.originalname, { 
  type: file.mimetype 
});
const uploadResult = await utapi.uploadFiles([fileObject]);
```

### Solução 4: Usar uploadFilesFromUrl como alternativa

Se o upload direto continuar a falhar, pode-se usar uma abordagem alternativa:

1. Guardar temporariamente o ficheiro
2. Gerar um URL assinado temporário
3. Usar `utapi.uploadFilesFromUrl()`

## Variáveis de Ambiente Necessárias

Certificar que as seguintes variáveis estão configuradas no Render:

```env
# Opção 1: Formato V7 (recomendado)
UPLOADTHING_TOKEN="base64-encoded-json"

# Opção 2: Formato legado
UPLOADTHING_SECRET="sk_live_..."
UPLOADTHING_APP_ID="your-app-id"
```

## Próximos Passos Recomendados

1. **Implementar Solução 1** (mais simples) - passar `type` no terceiro parâmetro
2. **Testar localmente** se possível, para isolar o problema
3. **Verificar versão do Node.js** no Render (precisa de 20+ para File API)
4. **Considerar downgrade** da versão do pacote `uploadthing` se for um bug da versão atual

## Informações Adicionais

### Versões dos Pacotes

Verificar no `package.json`:
```json
{
  "uploadthing": "^7.x.x"
}
```

### Ficheiros Relacionados

- `server/routes/documents.ts` - Rota de upload
- `server/lib/uploadthing.ts` - Configuração do UTApi
- `server/middleware/upload.ts` - Configuração do Multer

### Histórico de Tentativas

| Tentativa | Abordagem | Resultado |
|-----------|-----------|-----------|
| 1 | Objeto simples `{ name, type, data }` | Erro: INVALID_SERVER_CONFIG |
| 2 | UTFile com Buffer direto | Erro: UPLOAD_FAILED (Transport) |
| 3 | UTFile com Uint8Array | Erro: UPLOAD_FAILED (Transport) |
| 4 | UTFile com Blob | Erro: UPLOAD_FAILED (Transport) |

## Conclusão

O problema parece estar relacionado com a forma como o `UTFile` está a ser construído. O facto de o `formData` estar vazio no pedido HTTP sugere que o conteúdo do ficheiro não está a ser corretamente serializado. A solução mais provável é passar o parâmetro `type` explicitamente no terceiro argumento do construtor `UTFile`.

---

**Data**: 2026-02-15  
**Autor**: Análise automática  
**Status**: Pendente de resolução
