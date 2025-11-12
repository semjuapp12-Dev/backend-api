# Documentação Detalhada do Código-Fonte do Backend

Este documento fornece uma análise minuciosa de cada pasta, arquivo e função implementada no backend do projeto "Hub da Juventude", desenvolvido em Node.js com Express e Mongoose (MongoDB).

O objetivo é servir como um guia completo para a compreensão da arquitetura e da lógica de negócio.

---

## 1. Estrutura de Diretórios (`node_api/src`)

A API segue uma arquitetura modular, separando responsabilidades em pastas específicas:

| Pasta | Responsabilidade | Descrição |
| :--- | :--- | :--- |
| `models/` | **Modelos de Dados** | Define os esquemas (schemas) do MongoDB usando Mongoose, representando as entidades do sistema (Usuário, Conteúdo, etc.). |
| `controllers/` | **Lógica de Negócio** | Contém as funções que processam as requisições HTTP (Request) e preparam as respostas (Response). É o "cérebro" da aplicação. |
| `routes/` | **Definição de Rotas** | Mapeia as URLs (endpoints) para as funções dos controladores correspondentes. |
| `middlewares/` | **Intercepção de Requisições** | Funções que são executadas antes ou depois dos controladores, como autenticação e verificação de permissões. |
| `services/` | **Serviços Auxiliares** | Funções de lógica complexa que podem ser reutilizadas por vários controladores (ex: Gamificação). |
| `app.js` | **Ponto de Entrada** | Configura o servidor Express, a conexão com o MongoDB e integra todos os middlewares e rotas. |

---

## 2. Modelos de Dados (`src/models/`)

Os modelos definem a estrutura dos documentos no MongoDB e incluem lógica de validação e *hooks* de ciclo de vida.

### 2.1. `User.js` (Usuário)

Define o esquema principal do usuário, incluindo dados pessoais, níveis de acesso e integração com o sistema de gamificação.

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `nomeCompleto` | `String` | Nome completo do usuário. |
| `email`, `cpf` | `String` | Campos únicos e obrigatórios para identificação. |
| `senha` | `String` | Senha criptografada (não retornada por padrão: `select: false`). |
| `nivelAcesso` | `String` | Define a permissão: `'jovem'`, `'administrador'`, `'editor'`, `'moderador'`. |
| `pontuacao` | `Number` | Pontuação total do usuário (Gamificação). |
| `conquistasDesbloqueadas` | `Array<ObjectId>` | Referência às conquistas que o usuário já desbloqueou. |

**Lógica de Destaque:**

*   **`pre('save')` Hook:** Antes de salvar, verifica se a senha foi modificada e, em caso afirmativo, a criptografa usando `bcrypt` (salt de 10).
*   **`comparePassword(candidatePassword)`:** Método customizado para comparar a senha fornecida no login com a senha criptografada no banco de dados.

### 2.2. `Content.js` (Conteúdo)

Define o esquema para todos os tipos de conteúdo (Notícia, Evento, Vaga, Curso).

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `titulo`, `corpo` | `String` | Título e corpo do conteúdo. |
| `tipo` | `String` | Enum: `'noticia'`, `'evento'`, `'vaga'`, `'curso'`. |
| `autor` | `ObjectId` | Referência ao `User` que criou o conteúdo. |
| `curtidas` | `Array<ObjectId>` | Lista de IDs de `User` que curtiram o conteúdo. |
| `comentariosCount` | `Number` | Contador de comentários (mantido pelo `commentController`). |
| **Campos Expandidos** | `Date`, `String` | Inclui campos como `dataInicio`, `local`, `salario`, `contato`, `tipoEvento` para suportar Eventos, Oportunidades e Cursos. |

### 2.3. `Comment.js` (Comentário)

Define o esquema para comentários em um conteúdo.

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `conteudoId` | `ObjectId` | Referência ao `Content` ao qual o comentário pertence. |
| `autorId` | `ObjectId` | Referência ao `User` que escreveu o comentário. |
| `denuncias` | `Array<ObjectId>` | Lista de IDs de `User` que denunciaram o comentário. |
| `moderado` | `Boolean` | Indica se o comentário já foi revisado por um moderador. |

### 2.4. `Achievement.js` (Conquista)

Define o esquema para as conquistas do sistema de gamificação.

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `nome`, `descricao` | `String` | Detalhes da conquista. |
| `pontuacao` | `Number` | Quantidade de pontos que o usuário ganha ao desbloquear. |
| `criterioDesbloqueio` | `String` | Descrição do critério técnico para desbloqueio (ex: "participar de 3 eventos"). |
| `visibilidade` | `String` | Enum: `'publica'` ou `'oculta'`. |

---

## 3. Controladores (`src/controllers/`)

Os controladores contêm a lógica de negócio e interagem com os modelos.

### 3.1. `authController.js` (Autenticação)

| Função | Rota | Lógica Principal |
| :--- | :--- | :--- |
| `register` | `POST /api/auth/register` | Valida dados, verifica duplicidade de e-mail/CPF, cria `User` (a senha é criptografada no `pre-save` do modelo) e retorna um JWT. |
| `login` | `POST /api/auth/login` | Valida e-mail/senha, usa `User.comparePassword` para verificar a senha e retorna um JWT. |
| `me` | `GET /api/auth/me` | Rota protegida que retorna os dados do usuário autenticado (`req.user`). |

### 3.2. `contentController.js` (Conteúdo)

| Função | Rota | Lógica Principal |
| :--- | :--- | :--- |
| `createContent` | `POST /api/content` | **Permissão:** Requer `'administrador'` ou `'editor'`. Cria um novo `Content`, simulando o upload de imagens com URLs de placeholder. |
| `listContent` | `GET /api/content` | Implementa filtros por `categoria`, `tipo` e `search`, além de paginação (`page`, `limit`). Popula o campo `autor`. |
| `updateContent` | `PUT /api/content/:id` | **Permissão:** Requer `'administrador'`, `'editor'` **OU** ser o `autor` do conteúdo. |
| `deleteContent` | `DELETE /api/content/:id` | **Permissão:** Requer `'administrador'`, `'editor'` **OU** ser o `autor` do conteúdo. |
| `toggleLike` | `POST /api/content/:id/like` | Adiciona ou remove o ID do usuário do array `curtidas` do `Content`. |

### 3.3. `commentController.js` (Comentários e Moderação)

| Função | Rota | Lógica Principal |
| :--- | :--- | :--- |
| `createComment` | `POST /api/comments` | Cria o `Comment` e incrementa o `comentariosCount` no `Content` relacionado. |
| `deleteComment` | `DELETE /api/comments/:id` | **Permissão:** Requer `'administrador'`, `'moderador'` **OU** ser o `autorId`. Decrementa o `comentariosCount`. |
| `reportComment` | `POST /api/comments/:id/report` | Adiciona o ID do usuário ao array `denuncias` do `Comment`. |
| `listReportedComments` | `GET /api/comments/moderation` | **Permissão:** Requer `'administrador'` ou `'moderador'`. Lista comentários com denúncias e que ainda não foram moderados. |
| `moderateComment` | `PUT /api/comments/:id/moderate` | **Permissão:** Requer `'administrador'` ou `'moderador'`. Permite `action: 'approve'` (marca como moderado e limpa denúncias) ou `action: 'delete'` (reutiliza `deleteComment`). |

### 3.4. `userController.js` (Gerenciamento de Usuários - Admin)

| Função | Rota | Lógica Principal |
| :--- | :--- | :--- |
| `listUsers` | `GET /api/users` | **Permissão:** Requer `'administrador'`. Lista usuários com filtros e paginação. Exclui o campo `senha`. |
| `getUserById` | `GET /api/users/:id` | **Permissão:** Requer `'administrador'`. Retorna um usuário específico. |
| `updateUser` | `PUT /api/users/:id` | **Permissão:** Requer `'administrador'`. Permite atualizar dados do usuário (ex: `nivelAcesso`, `ativo`), mas **ignora** tentativas de alterar a senha. |
| `deleteUser` | `DELETE /api/users/:id` | **Permissão:** Requer `'administrador'`. Deleta o usuário. |

### 3.5. `achievementController.js` (Conquistas)

| Função | Rota | Lógica Principal |
| :--- | :--- | :--- |
| `createAchievement` | `POST /api/achievements` | **Permissão:** Requer `'administrador'`. Cria uma nova conquista. |
| `listAchievements` | `GET /api/achievements` | Lista conquistas. Se o usuário for Admin, lista todas; caso contrário, lista apenas as `'publica'`. |
| `updateAchievement` | `PUT /api/achievements/:id` | **Permissão:** Requer `'administrador'`. Atualiza uma conquista. |
| `deleteAchievement` | `DELETE /api/achievements/:id` | **Permissão:** Requer `'administrador'`. Deleta uma conquista. |

### 3.6. `dashboardController.js` (Dashboard Admin)

| Função | Rota | Lógica Principal |
| :--- | :--- | :--- |
| `getSummary` | `GET /api/dashboard/summary` | **Permissão:** Requer `'administrador'`. Retorna métricas chave: contagem de usuários, eventos, oportunidades, cursos, conquistas e a pontuação média dos usuários. |

---

## 4. Middlewares e Serviços

### 4.1. `middlewares/auth.js` (Autenticação e Permissão)

Este arquivo configura o `passport-jwt` e define os middlewares de segurança.

| Componente | Descrição |
| :--- | :--- |
| `jwtLogin` | Estratégia do Passport que extrai o JWT do cabeçalho `Authorization: Bearer` e busca o usuário no DB pelo ID contido no token (`payload.sub`). |
| `requireAuth` | Middleware que usa `passport.authenticate('jwt', { session: false })`. Garante que a requisição tenha um token válido e popula `req.user` com os dados do usuário. |
| `requirePermission(allowedRoles)` | Middleware que recebe um array de níveis de acesso permitidos (ex: `['administrador', 'editor']`). Verifica se `req.user.nivelAcesso` está no array e retorna `403 Forbidden` caso contrário. |

### 4.2. `services/gamificationService.js` (Gamificação)

Contém a lógica para manipular a pontuação e as conquistas dos usuários.

| Função | Descrição |
| :--- | :--- |
| `addPoints(userId, points)` | Encontra o usuário e incrementa o campo `pontuacao` no MongoDB usando `$inc`. |
| `unlockAchievement(userId, achievementId)` | Verifica se o usuário já possui a conquista. Se não, adiciona o `achievementId` ao array `conquistasDesbloqueadas` e adiciona a `pontuacao` da conquista à pontuação total do usuário. |
| `checkAchievements(userId, eventType)` | **Função Placeholder:** Demonstra como a lógica de gamificação seria acionada após eventos do usuário (ex: `content_liked`). Em um sistema real, conteria a lógica para verificar critérios complexos. |

---

## 5. Ponto de Entrada (`src/app.js`)

O coração da aplicação Express.

| Seção | Lógica Principal |
| :--- | :--- |
| **Configuração** | Importa `dotenv`, `express`, `mongoose`, `helmet`, `cors` e `passport`. |
| **Middlewares** | Usa `helmet` (segurança), `cors` (permissão de acesso), `express.json()` (parsing de JSON) e `passport.initialize()`. |
| **Conexão DB** | Conecta ao MongoDB usando `mongoose.connect(MONGO_URI)`. Em caso de falha, encerra a aplicação. |
| **Rotas** | Importa e usa todas as rotas (`authRoutes`, `contentRoutes`, `userRoutes`, etc.) sob o prefixo `/api/`. |
| **Inicialização** | Inicia o servidor Express na porta definida por `process.env.PORT` (padrão 3000). |

---

## 6. Serviço de Dados Python (`python_data_service/`)

Este diretório foi estruturado para atender à exigência de uso do PyMongo.

| Arquivo | Descrição |
| :--- | :--- |
| `requirements.txt` | Lista as dependências Python: `pymongo`, `python-dotenv`. |
| `data_processor.py` | **Script Placeholder:** Contém a estrutura básica para se conectar ao MongoDB usando PyMongo e executar consultas de análise de dados (ex: contagem de usuários, análise de engajamento). Este script deve ser expandido para as necessidades específicas de relatórios. |

Este documento detalha cada parte do código desenvolvido, fornecendo a base para a manutenção e expansão futura do projeto.
