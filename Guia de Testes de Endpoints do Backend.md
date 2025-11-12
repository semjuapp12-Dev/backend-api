# Guia de Testes de Endpoints do Backend

Este documento fornece um guia passo a passo para testar todos os endpoints da API do Hub da Juventude, utilizando um cliente HTTP (como Postman, Insomnia ou cURL).

**Pré-requisito:** Certifique-se de que o servidor Node.js esteja rodando (`npm run dev`) e o MongoDB esteja acessível.

**URL Base:** `http://localhost:3000/api`

---

## Módulo 1: Autenticação e Usuários

### Passo 1.1: Registrar um Usuário Comum (Jovem)

**Objetivo:** Criar um usuário com o nível de acesso padrão (`jovem`).

| Detalhe | Valor |
| :--- | :--- |
| **Método** | `POST` |
| **URL** | `/auth/register` |
| **Body** | `JSON` |

**Corpo da Requisição:**
```json
{
  "nomeCompleto": "Usuario Jovem Teste",
  "email": "jovem@teste.com",
  "cpf": "11122233344",
  "dataNascimento": "2000-01-01",
  "senha": "senhaSegura123"
}
```
**Ação:** **SALVE O TOKEN** retornado. Ele será o `TOKEN_JOVEM`.

### Passo 1.2: Registrar um Usuário Administrador (Simulação)

**Objetivo:** Criar um usuário que será promovido a administrador para testes de permissão.

**Corpo da Requisição:** (Use um e-mail e CPF diferentes)
```json
{
  "nomeCompleto": "Admin Teste",
  "email": "admin@teste.com",
  "cpf": "55566677788",
  "dataNascimento": "1990-01-01",
  "senha": "senhaAdmin123"
}
```
**Ação:** **SALVE O TOKEN** retornado. Ele será o `TOKEN_ADMIN`.

**Ação Manual (Obrigatória):** Para que o `TOKEN_ADMIN` funcione com permissões de administrador, você deve **alterar manualmente** o campo `nivelAcesso` do usuário `admin@teste.com` no MongoDB para `'administrador'`.

### Passo 1.3: Login

**Objetivo:** Obter um novo token para o usuário jovem.

| Detalhe | Valor |
| :--- | :--- |
| **Método** | `POST` |
| **URL** | `/auth/login` |
| **Body** | `JSON` |

**Corpo da Requisição:**
```json
{
  "email": "jovem@teste.com",
  "senha": "senhaSegura123"
}
```
**Ação:** O token retornado deve ser o mesmo `TOKEN_JOVEM`.

### Passo 1.4: Rota Protegida (`/me`)

**Objetivo:** Testar se o token está funcionando.

| Detalhe | Valor |
| :--- | :--- |
| **Método** | `GET` |
| **URL** | `/auth/me` |
| **Header** | `Authorization: Bearer TOKEN_JOVEM` |

**Resultado Esperado:** Status `200 OK` com os dados do usuário.

---

## Módulo 2: Gerenciamento de Conteúdo (CRUD)

### Passo 2.1: Criar Conteúdo (Notícia)

**Objetivo:** Testar a criação de conteúdo com o `TOKEN_ADMIN`.

| Detalhe | Valor |
| :--- | :--- |
| **Método** | `POST` |
| **URL** | `/content` |
| **Header** | `Authorization: Bearer TOKEN_ADMIN` |
| **Body** | `JSON` |

**Corpo da Requisição:**
```json
{
  "titulo": "Notícia de Teste",
  "corpo": "Corpo da notícia de teste.",
  "tipo": "noticia",
  "categoria": "Geral"
}
```
**Ação:** **SALVE O ID** do conteúdo retornado. Ele será o `CONTENT_ID`.

### Passo 2.2: Criar Conteúdo (Evento)

**Objetivo:** Testar a criação de um evento com campos expandidos.

**Corpo da Requisição:**
```json
{
  "titulo": "Evento de Lançamento",
  "corpo": "Descrição do evento.",
  "tipo": "evento",
  "categoria": "Tecnologia",
  "dataInicio": "2025-12-01T10:00:00Z",
  "local": "Auditório Principal",
  "tipoEvento": "livre"
}
```

### Passo 2.3: Listar Conteúdo

**Objetivo:** Testar a listagem e filtros.

| Detalhe | Valor |
| :--- | :--- |
| **Método** | `GET` |
| **URL** | `/content?tipo=evento&limit=5` |

**Resultado Esperado:** Status `200 OK` com a lista de eventos.

### Passo 2.4: Curtir Conteúdo

**Objetivo:** Testar a interação com o `TOKEN_JOVEM`.

| Detalhe | Valor |
| :--- | :--- |
| **Método** | `POST` |
| **URL** | `/content/CONTENT_ID/like` |
| **Header** | `Authorization: Bearer TOKEN_JOVEM` |

**Ação:** Repita a requisição para testar o **Descurtir** (toggle).

---

## Módulo 3: Interação (Comentários)

### Passo 3.1: Criar Comentário

**Objetivo:** Testar a criação de um comentário no `CONTENT_ID`.

| Detalhe | Valor |
| :--- | :--- |
| **Método** | `POST` |
| **URL** | `/comments` |
| **Header** | `Authorization: Bearer TOKEN_JOVEM` |
| **Body** | `JSON` |

**Corpo da Requisição:**
```json
{
  "conteudoId": "CONTENT_ID",
  "texto": "Ótimo conteúdo! Parabéns."
}
```
**Ação:** **SALVE O ID** do comentário retornado. Ele será o `COMMENT_ID`.

### Passo 3.2: Denunciar Comentário

**Objetivo:** Testar a denúncia de um comentário (pode ser o seu próprio).

| Detalhe | Valor |
| :--- | :--- |
| **Método** | `POST` |
| **URL** | `/comments/COMMENT_ID/report` |
| **Header** | `Authorization: Bearer TOKEN_JOVEM` |

**Resultado Esperado:** Status `200 OK`.

---

## Módulo 4: Moderação e Admin

### Passo 4.1: Listar Comentários Denunciados

**Objetivo:** Testar a rota de moderação com o `TOKEN_ADMIN`.

| Detalhe | Valor |
| :--- | :--- |
| **Método** | `GET` |
| **URL** | `/comments/moderation` |
| **Header** | `Authorization: Bearer TOKEN_ADMIN` |

**Resultado Esperado:** Status `200 OK` com o `COMMENT_ID` listado.

### Passo 4.2: Moderar Comentário (Aprovar)

**Objetivo:** Aprovar o comentário denunciado.

| Detalhe | Valor |
| :--- | :--- |
| **Método** | `PUT` |
| **URL** | `/comments/COMMENT_ID/moderate` |
| **Header** | `Authorization: Bearer TOKEN_ADMIN` |
| **Body** | `JSON` |

**Corpo da Requisição:**
```json
{
  "action": "approve"
}
```
**Resultado Esperado:** Status `200 OK`.

---

## Módulo 5: Gamificação (Conquistas)

### Passo 5.1: Criar Conquista

**Objetivo:** Testar a criação de uma conquista com o `TOKEN_ADMIN`.

| Detalhe | Valor |
| :--- | :--- |
| **Método** | `POST` |
| **URL** | `/achievements` |
| **Header** | `Authorization: Bearer TOKEN_ADMIN` |
| **Body** | `JSON` |

**Corpo da Requisição:**
```json
{
  "nome": "Primeiro Like",
  "descricao": "Curtiu seu primeiro conteúdo.",
  "categoria": "Interação",
  "pontuacao": 10,
  "criterioDesbloqueio": "user_liked_content",
  "iconeEmblema": "url_do_icone"
}
```
**Ação:** **SALVE O ID** da conquista. Ele será o `ACHIEVEMENT_ID`.

### Passo 5.2: Listar Conquistas (Jovem)

**Objetivo:** Testar se o usuário comum vê apenas conquistas públicas.

| Detalhe | Valor |
| :--- | :--- |
| **Método** | `GET` |
| **URL** | `/achievements` |
| **Header** | `Authorization: Bearer TOKEN_JOVEM` |

**Resultado Esperado:** Status `200 OK` com a lista de conquistas.

---

## Módulo 6: Dashboard Admin

### Passo 6.1: Obter Resumo do Dashboard

**Objetivo:** Testar a rota de resumo administrativo.

| Detalhe | Valor |
| :--- | :--- |
| **Método** | `GET` |
| **URL** | `/dashboard/summary` |
| **Header** | `Authorization: Bearer TOKEN_ADMIN` |

**Resultado Esperado:** Status `200 OK` com contagens de usuários, conteúdos, conquistas e métricas.

---

## Módulo 7: Serviço de Dados Python (PyMongo)

**Objetivo:** Testar a conexão do PyMongo com o MongoDB.

**Ação:**
1.  Navegue até o diretório `python_data_service`.
2.  Certifique-se de que o ambiente virtual está ativo e as dependências instaladas.
3.  Execute o script:
    ```bash
    python data_processor.py
    ```
**Resultado Esperado:** O script deve se conectar ao MongoDB e executar a lógica de processamento de dados definida.
