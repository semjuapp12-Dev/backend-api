**Rota Agregada (Feed) — Passo a Passo**

Objetivo: criar uma rota que retorna juntos `eventos`, `notícias` (conteúdos), `oportunidades` e `cursos` em uma única resposta paginada/ordenada.

Assunções rápidas:
- O backend usa Express + Mongoose.
- Modelos disponíveis em `src/models`: `Evento.js`, `Content.js`, `Oportunidade.js`, `Curso.js`.
- Você quer um endpoint `GET /api/feed` que aceite `limit`, `page` ou `since`.

Passos:

1) Criar o controller agregador
- Arquivo: `src/controllers/combinedController.js`
- Função principal: `getFeed(req, res)` que busca de cada modelo (ideal: em paralelo) e combina resultados ordenando por data.

Exemplo de conteúdo para `src/controllers/combinedController.js`:

```js
const Evento = require('../models/Evento');
const Content = require('../models/Content');
const Oportunidade = require('../models/Oportunidade');
const Curso = require('../models/Curso');

// Helper para normalizar cada item no formato { type, date, payload }
function normalizeItem(type, doc, dateField = 'createdAt') {
  return {
    type,
    date: doc[dateField] || doc.createdAt || doc.updatedAt,
    payload: doc,
  };
}

exports.getFeed = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const skip = (page - 1) * limit;

    // Buscar cada coleção em paralelo. Ajuste filtros/ordem conforme seu schema.
    const [eventos, noticias, oportunidades, cursos] = await Promise.all([
      Evento.find().sort({ createdAt: -1 }).limit(limit).lean(),
      Content.find().sort({ createdAt: -1 }).limit(limit).lean(),
      Oportunidade.find().sort({ createdAt: -1 }).limit(limit).lean(),
      Curso.find().sort({ createdAt: -1 }).limit(limit).lean(),
    ]);

    // Normalizar
    const items = [];
    eventos.forEach(e => items.push(normalizeItem('evento', e)));
    noticias.forEach(n => items.push(normalizeItem('noticia', n)));
    oportunidades.forEach(o => items.push(normalizeItem('oportunidade', o)));
    cursos.forEach(c => items.push(normalizeItem('curso', c)));

    // Ordenar por data decrescente e aplicar paginação (skip/limit)
    items.sort((a, b) => new Date(b.date) - new Date(a.date));
    const paged = items.slice(skip, skip + limit);

    res.json({ page, limit, count: items.length, results: paged });
  } catch (err) {
    console.error('Erro getFeed:', err);
    res.status(500).json({ error: 'Erro ao montar feed' });
  }
};
```

Observações:
- O exemplo usa `.limit(limit)` em cada busca para evitar trazer toda a coleção — ajuste se precisar de estratégias de paginação mais robustas.
- Se cada coleção tiver muitos documentos, preferir buscar apenas os N mais recentes de cada e depois mesclar.

2) Criar a rota
- Arquivo: `src/routes/combinedRoutes.js`

Exemplo:

```js
const express = require('express');
const router = express.Router();
const combinedController = require('../controllers/combinedController');

// GET /api/feed?limit=20&page=1
router.get('/feed', combinedController.getFeed);

module.exports = router;
```

3) Registrar a rota em `src/app.js`
- Abra `src/app.js` e importe/ use a rota:

```js
// em src/app.js (trecho)
const combinedRoutes = require('./routes/combinedRoutes');
app.use('/api', combinedRoutes);
```

4) Ajustes finos e validações
- Se quiser filtrar por tipo: aceite `?types=evento,noticia` e filtre ao montar `items`.
- Para `since` (incremental): aceite `?since=2025-01-01T00:00:00Z` e filtre cada consulta como `{ createdAt: { $gt: new Date(since) } }`.
- Use `express-validator` se quiser validar `limit`, `page` e `since` antes do controller.

5) Caching (opcional)
- Feed agregado costuma se beneficiar de cache (Redis). Coloque cache por `key = feed:limit=20:page=1:types=...`.

6) Migração de campos de data
- Se seus modelos não têm `createdAt`, habilite timestamps no schema ou ajuste `dateField` na normalização.

7) Testes rápidos (curl)

```bash
curl -X GET "http://localhost:3000/api/feed?limit=10&page=1"
```

Resposta esperada (exemplo):

```json
{
  "page":1,
  "limit":10,
  "count": 37,
  "results":[
    {"type":"noticia","date":"2025-12-11T10:00:00.000Z","payload":{...}},
    {"type":"evento","date":"2025-12-10T12:00:00.000Z","payload":{...}},
    ...
  ]
}
```

8) Testes automatizados
- Crie testes que populam bases de teste com alguns documentos e chamam `GET /api/feed` verificando ordenação e tipos.

9) Documentação
- Atualize o README ou `Guia de Testes de Endpoints do Backend.md` com exemplos de querystring e exemplos de payload.

Boas práticas e variações:
- Se os documentos possuem esquemas diferentes e você precisa de um subset de campos no feed, use `.select('title createdAt shortDescription')` em cada consulta para reduzir payload.
- Para feeds grandes use `merge k-way` com índices em `createdAt` em cada coleção e paginação baseada em cursor (`lastDate` + `lastType`), em vez do `slice` em memória.

Quer que eu:
- Gere automaticamente os arquivos `src/controllers/combinedController.js` e `src/routes/combinedRoutes.js` no projeto?
- Ou apenas crie o patch/diff para você aplicar manualmente?

Fim.