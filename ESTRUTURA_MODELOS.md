# Estrutura básica dos modelos

Arquivo de referência com a estrutura (campos, tipos e observações) dos modelos usados no feed: `Evento`, `Content`, `Oportunidade`, `Curso`.

**1) Evento (`src/models/Evento.js`)**
- `titulo`: String — obrigatório
- `descricao`: String — opcional
- `organizador`: String — opcional
- `data`: Date — obrigatório (data do evento)
- `hora`: String — opcional
- `local`: String — opcional
- `status`: String — padrão `'Upcoming'`
- `destacado`: Boolean — padrão `false`
- `acesso`: String — enum `['Público', 'Privado']`, padrão `'Público'`
- `vagas`: Number — opcional (pode ser `null` se ilimitado)
- `vagasOcupadas`: Number — padrão `0` (contador de vagas ocupadas)
- `conteudos`: [{ `titulo`: String — obrigatório, `itens`: [String] }] — array de objetos para conteúdos do evento
- `contatos`: [{ `telefone`: String, `email`: String, `redeSocial`: String }] — array de objetos para contatos
- `imagem`: String — URL ou referência de mídia
- `tags`: [String]
- `criadoEm`: Date — padrão `Date.now`

Observação: campo de data principal é `data`; o modelo também usa `criadoEm` para registro. Novos campos `vagasOcupadas`, `conteudos` e `contatos` suportam gestão de inscrições e detalhes adicionais.

**2) Content (conteúdos / notícias) (`src/models/Content.js`)**
- `titulo`: String — obrigatório, `trim`
- `corpo`: String — obrigatório (texto principal)
- `tipo`: String — enum `['noticia', 'evento', 'vaga']`, obrigatório
- `categoria`: String — obrigatório, `trim`
- `imagens`: [String] — array de URLs, padrão `[]`
- `videoUrl`: String — URL do vídeo, opcional
- `linkExterno`: String — opcional
- `dataInicio`: Date — opcional (quando aplicável a eventos/cursos)
- `dataFim`: Date — opcional
- `local`: String — opcional
- `salario`: String — opcional (para oportunidades)
- `prazoInscricao`: Date — opcional
- `contato`: Object — `{ nome: String, email: String, telefone: String }`
- `tipoEvento`: String — enum `['livre','fechado']`, padrão `'livre'`
- `vagas`: Number — opcional
- `duracao`: String — opcional (para cursos)
- `destaque`: Boolean — padrão `false`
- `autor`: ObjectId — `ref: 'User'`, obrigatório
- `curtidas`: [ObjectId] — `ref: 'User'` (array de ids)
- `comentariosCount`: Number — contador, padrão `0`
- timestamps: `createdAt`, `updatedAt` (o schema usa `{ timestamps: true }`)

Observação: o `Content` é um modelo genérico que agrega notícias, eventos e vagas, por isso possui campos opcionais para vários tipos.

**3) Oportunidade (`src/models/Oportunidade.js`)**
- `titulo`: String — obrigatório
- `descricao`: String — opcional
- `organizador`: String — opcional
- `empresa`: String — obrigatório
- `cargo`: String — obrigatório
- `local`: String — opcional
- `status`: String — padrão `'Upcoming'`
- `salario`: String — opcional
- `horaTrabalho`: String — opcional
- `dataInicio`: Date — obrigatório (data de início do curso)
- `dataFim`: Date — obrigatório (data de fim do curso)
- `destacado`: Boolean — padrão `false`
- `conteudos`: [{ `titulo`: String — obrigatório, `itens`: [String] }] — array de objetos para conteúdos do curso
- `contatos`: [{ `telefone`: String, `email`: String, `redeSocial`: String }] — array de objetos para contatos
- `vagas`: Number — opcional (pode ser `null` se ilimitado)
- `sobreEmpresa`: String — opcional
- `criadoEm`: Date — padrão `Date.now`

**4) Curso (`src/models/Curso.js`)**
- `titulo`: String — obrigatório
- `descricao`: String — obrigatório
- `organizacao`: String — opcional
- `dataInicio`: Date — obrigatório (data de início do curso)
- `dataFim`: Date — obrigatório (data de fim do curso)
- `hora`: String — opcional
- `local`: String — opcional
- `status`: String — padrão `'Upcoming'`
- `destacado`: Boolean — padrão `false`
- `vagas`: Number — opcional (pode ser `null` se ilimitado)
- `vagasOcupadas`: Number — padrão `0` (contador de vagas ocupadas)
- `conteudos`: [{ `titulo`: String — obrigatório, `itens`: [String] }] — array de objetos para conteúdos do curso
- `contatos`: [{ `telefone`: String, `email`: String, `redeSocial`: String }] — array de objetos para contatos
- `imagem`: String — URL ou referência de mídia
- `tags`: [String]
- `criadoEm`: Date — padrão `Date.now`

Observação: campos de data principais são `dataInicio` e `dataFim`; o modelo suporta gestão de inscrições com `vagas` e `vagasOcupadas`. Novos campos `conteudos` e `contatos` permitem detalhes adicionais.

---

Notas gerais:
- Alguns modelos usam `criadoEm` em vez de `createdAt`; `Content` usa `timestamps` (logo tem `createdAt`/`updatedAt`). Ao agregar dados no feed, normalize o campo de data (ex.: `createdAt || criadoEm || data`) para ordenar corretamente.
- Para reduzir payload no feed, selecione apenas os campos necessários com `.select(...)` nas queries.
- Se quiser, eu posso gerar um arquivo JSON de exemplo com um documento de cada modelo para testes.
