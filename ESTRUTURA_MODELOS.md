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
- `highlighted`: Boolean — padrão `false`
- `acesso`: String — enum `['Público', 'Privado']`, padrão `'Público'`
- `vagas`: Number — opcional (pode ser `null` se ilimitado)
- `imagem`: String — URL ou referência de mídia
- `tags`: [String]
- `criadoEm`: Date — padrão `Date.now`

Observação: campo de data principal é `data`; o modelo também usa `criadoEm` para registro.

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
- `cargo`: String — obrigatório
- `empresa`: String — obrigatório
- `descricao`: String — opcional
- `requisitos`: [String] — array de requisitos
- `localizacao`: String — opcional
- `horario`: String — opcional
- `salario`: String — opcional
- `dataInicio`: Date — opcional
- `prazo`: Date — opcional
- `contatoNome`: String — opcional
- `contatoFuncao`: String — opcional
- `contatoEmail`: String — opcional
- `contatoTelefone`: String — opcional
- `status`: String — enum `['Aberta','Fechada','Pendente']`, padrão `'Aberta'`
- `criadoEm`: Date — padrão `Date.now`

Observação: campos de contato são armazenados como campos planos (nome, email, telefone).

**4) Curso (`src/models/Curso.js`)**
- `titulo`: String — obrigatório
- `descricao`: String — obrigatório
- `vagasTotais`: Number — padrão `0`
- `data`: Date — obrigatório (data do curso)
- `horaInicio`: String — opcional
- `horaFim`: String — opcional
- `local`: String — opcional
- `organizacao`: String — opcional
- `tags`: [String]
- `requisitos`: [String]
- `destacado`: Boolean — padrão `false`
- `mediaName`: String — nome/URL do arquivo de mídia
- `mediaType`: String — ex: `'image'` ou `'video'`
- `status`: String — padrão `'Ativo'`
- `criadoEm`: Date — padrão `Date.now`

Observação: `Curso` tem campos próprios para mídia e vagas; o campo `data` é o principal para ordenação por data do evento/curso.

---

Notas gerais:
- Alguns modelos usam `criadoEm` em vez de `createdAt`; `Content` usa `timestamps` (logo tem `createdAt`/`updatedAt`). Ao agregar dados no feed, normalize o campo de data (ex.: `createdAt || criadoEm || data`) para ordenar corretamente.
- Para reduzir payload no feed, selecione apenas os campos necessários com `.select(...)` nas queries.
- Se quiser, eu posso gerar um arquivo JSON de exemplo com um documento de cada modelo para testes.
