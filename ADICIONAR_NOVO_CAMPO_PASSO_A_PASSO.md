**Adicionar Novo Campo (Passo a Passo)**

- **Objetivo:**: Explicar como adicionar um novo campo aos dados inseridos pela API Node (Mongoose + Express).
- **Escopo:**: Mostra as alterações no modelo Mongoose, controller, rotas e notas sobre clientes/testes.

**1. Escolher o modelo**: 
- **Descrição:**: Identifique o modelo que armazena os dados onde você quer o novo campo. Ex.: o modelo de conteúdo está em [src/models/Content.js](src/models/Content.js).

**2. Atualizar o modelo Mongoose**:
- **Arquivo:**: [src/models/Content.js](src/models/Content.js)
- **O que fazer:**: Abra o arquivo e no `Schema` adicione a nova propriedade com o tipo e validações desejadas.
- **Exemplo:** — adicionar um campo `summary` opcional do tipo `String`:

```js
// Antes (trecho simplificado de schema):
const ContentSchema = new Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  // ...
});

// Depois:
const ContentSchema = new Schema({
  title: { type: String, required: true },
  summary: { type: String, required: false, trim: true },
  body: { type: String, required: true },
  // ...
});
```

- **Dicas:**
  - Para campos obrigatórios, use `required: true`.
  - Para valores padrões, use `default: '...'`.
  - Se for um campo com enum, use `enum: ['a','b']`.

**3. Atualizar o controller que cria/edita o recurso**:
- **Arquivo:**: [src/controllers/contentController.js](src/controllers/contentController.js)
- **O que fazer:**: Ao ler `req.body` na ação `create` (e `update`), inclua o novo campo e trate validações extras se necessário.
- **Exemplo (create):**

```js
// Antes (trecho):
const { title, body } = req.body;
const content = new Content({ title, body, author: req.user.id });
await content.save();

// Depois (incluindo summary):
const { title, body, summary } = req.body;
const content = new Content({ title, summary, body, author: req.user.id });
await content.save();
```

- **Validação adicional:**
  - Você pode validar `summary` no controller (ex.: limitar comprimento) antes de salvar:

```js
if (summary && summary.length > 300) {
  return res.status(400).json({ error: 'Resumo muito grande (max 300 caracteres).' });
}
```

**4. Atualizar as rotas e middlewares (se necessário)**:
- **Arquivo:**: [src/routes/contentRoutes.js](src/routes/contentRoutes.js)
- **O que fazer:**: Normalmente não é preciso mudar as rotas se o endpoint já aceita `req.body`. Apenas atualize comentários/documentação das rotas para listar o novo campo.

**5. Atualizar validações/regras globais (opcional)**:
- Se você usa bibliotecas como `express-validator` ou esquemas de validação, adicione o novo campo às regras.
- Exemplo com `express-validator`:

```js
body('summary').optional().isLength({ max: 300 }).withMessage('Resumo muito longo');
```

**6. Atualizar testes e documentação**:
- Atualize os testes unitários/integrados para enviar o novo campo em `POST`/`PUT`.
- Atualize o README ou o arquivo `Guia de Testes de Endpoints do Backend.md` com exemplos de payload.

**7. Atualizar clientes (frontend / scripts)**:
- Certifique-se de que o cliente que envia requisições inclua o novo campo quando apropriado.
- Exemplo `curl` de criação com `summary`:

```bash
curl -X POST http://localhost:3000/api/contents \
  -H 'Content-Type: application/json' \
  -d '{"title":"Meu título","summary":"Resumo rápido","body":"Texto..."}'
```

**8. Fazer migração de dados (se necessário)**:
- Se já existem documentos no banco e você precisa de um valor padrão, execute um script para atualizar documentos existentes.
- Exemplo em Node (script pequeno):

```js
const mongoose = require('mongoose');
const Content = require('./src/models/Content');

async function addDefaultSummary() {
  await mongoose.connect(process.env.MONGO_URL);
  await Content.updateMany({ summary: { $exists: false } }, { $set: { summary: 'Resumo não fornecido' } });
  console.log('Atualizados documentos sem summary');
  process.exit(0);
}
addDefaultSummary();
```

**9. Verificar e testar localmente**:
- Reinicie o servidor Node (`npm run dev` ou comando equivalente).
- Teste `POST /api/contents` com o novo campo.
- Verifique no banco que o campo apareceu nos documentos.

**10. Checklist rápido**:
- **Modelo:**: adicionado o campo em [src/models/Content.js](src/models/Content.js)
- **Controller:**: aceita/valida o campo em [src/controllers/contentController.js](src/controllers/contentController.js)
- **Rotas/Docs:**: rota documentada em [src/routes/contentRoutes.js](src/routes/contentRoutes.js)
- **Testes/Clientes:**: payloads e testes atualizados
- **Migração (opcional):**: script para preencher valores existentes

---

Se quiser, eu posso:
- Gerar o diff exato para `src/models/Content.js` e `src/controllers/contentController.js` com as alterações sugeridas.
- Criar o script de migração e um teste de integração que verifica o novo campo.

Diga qual modelo você quer alterar (por exemplo `Content` ou `User`) que eu aplico as mudanças automaticamente.