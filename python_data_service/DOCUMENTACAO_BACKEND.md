# Documentação Técnica do Backend - Hub da Juventude

## 1. Visão Geral do Projeto

Este documento detalha a arquitetura e as tecnologias a serem utilizadas no desenvolvimento do backend para o aplicativo "Hub da Juventude", conforme os requisitos funcionais e não-funcionais estabelecidos no documento de levantamento. O objetivo principal é centralizar a comunicação e as oportunidades da Secretaria da Juventude de Oriximiná em uma única plataforma digital.

O backend será construído com uma arquitetura de microsserviços ou monolítica modular, utilizando **Node.js** para a API principal e **MongoDB** como banco de dados. A exigência de usar **PyMongo** será atendida através de um microsserviço ou script de processamento de dados em Python, que se comunicará com o mesmo banco de dados MongoDB, ideal para tarefas de análise de dados e geração de relatórios.

## 2. Tecnologias e Justificativas

| Componente | Tecnologia | Justificativa |
| :--- | :--- | :--- |
| **Linguagem Principal** | Node.js (JavaScript/TypeScript) | Alta performance para I/O, ideal para APIs RESTful. Grande ecossistema de bibliotecas (NPM) e compatibilidade com o desenvolvimento moderno de aplicações. |
| **Framework Web** | Express.js | Framework minimalista e flexível para Node.js, amplamente utilizado para construir APIs robustas e escaláveis. |
| **Banco de Dados** | MongoDB | Banco de dados NoSQL baseado em documentos, ideal para a flexibilidade de dados de um feed de notícias, perfis de usuário e gerenciamento de conteúdo. |
| **Driver Node.js** | Mongoose | Biblioteca de modelagem de objetos (ODM) para MongoDB, que facilita a definição de esquemas e a interação com o banco de dados de forma mais estruturada. |
| **Linguagem de Dados/Relatórios** | Python | Linguagem robusta para processamento de dados. |
| **Driver Python** | PyMongo | Driver oficial para Python, essencial para a integração com o MongoDB para tarefas específicas de análise e relatórios, conforme solicitado. |
| **Autenticação** | Passport.js / JWT | Solução modular para autenticação em Node.js, suportando estratégias de Login Social (Google, Apple) e autenticação baseada em e-mail/senha, utilizando JSON Web Tokens (JWT) para segurança e statelessness. |
| **Segurança** | Helmet, CORS, bcrypt | Bibliotecas essenciais para proteger a API contra vulnerabilidades comuns (Helmet), gerenciar permissões de acesso (CORS) e criptografar senhas (bcrypt). |

## 3. Estrutura de Dados (Modelos Principais)

Com base nos requisitos, os seguintes modelos de dados serão necessários no MongoDB:

### 3.1. Usuário (`User`)

| Campo | Tipo | Descrição | Requisito |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | ID único do MongoDB. | Sistema |
| `nomeCompleto` | `String` | Nome completo do usuário. | Obrigatório |
| `email` | `String` | E-mail do usuário (único). | Obrigatório |
| `cpf` | `String` | CPF do usuário (único). | Obrigatório |
| `dataNascimento` | `Date` | Data de nascimento para validação etária. | Obrigatório |
| `senha` | `String` | Senha criptografada (hashing com bcrypt). | Obrigatório (para login tradicional) |
| `provedorSocial` | `String` | Ex: 'google', 'apple', 'null'. | Login Social |
| `idProvedorSocial` | `String` | ID único do usuário no provedor social. | Login Social |
| `fotoPerfil` | `String` | URL da foto de perfil. | Opcional |
| `biografia` | `String` | Biografia curta. | Opcional |
| `telefone` | `String` | Telefone/WhatsApp. | Opcional |
| `areasInteresse` | `[String]` | Array de categorias de interesse (Ex: 'Esporte', 'Cultura'). | Opcional |
| `nivelAcesso` | `String` | 'jovem', 'administrador', 'editor', 'moderador'. | Painel Admin |
| `ativo` | `Boolean` | Status de bloqueio do usuário. | Gerenciamento |

### 3.2. Conteúdo/Notícia (`Content`)

| Campo | Tipo | Descrição | Requisito |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | ID único do MongoDB. | Sistema |
| `titulo` | `String` | Título da notícia/postagem. | Feed |
| `corpo` | `String` | Conteúdo principal (suporta Markdown/HTML). | Feed |
| `tipo` | `String` | 'noticia', 'evento', 'vaga'. | Feed |
| `categoria` | `String` | Ex: 'Esporte', 'Educação', 'Vagas'. | Filtros |
| `imagens` | `[String]` | Array de URLs de imagens. | Formatos |
| `videoUrl` | `String` | URL de vídeo incorporado (YouTube/Vimeo). | Formatos |
| `linkExterno` | `String` | Link para fonte externa. | Formatos |
| `destaque` | `Boolean` | Indica se deve aparecer na seção "Destaques". | Organização |
| `dataPublicacao` | `Date` | Data e hora da publicação. | Cronológico |
| `autor` | `ObjectId` | Referência ao `User` (Editor/Admin) que publicou. | Painel Admin |
| `curtidas` | `[ObjectId]` | Array de IDs de `User` que curtiram. | Interação |
| `comentarios` | `[ObjectId]` | Array de referências a documentos `Comment`. | Interação |

### 3.3. Comentário (`Comment`)

| Campo | Tipo | Descrição | Requisito |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | ID único do MongoDB. | Sistema |
| `conteudoId` | `ObjectId` | Referência ao `Content` pai. | Interação |
| `autorId` | `ObjectId` | Referência ao `User` que comentou. | Interação |
| `texto` | `String` | O texto do comentário. | Interação |
| `dataCriacao` | `Date` | Data e hora do comentário. | Interação |
| `denuncias` | `[ObjectId]` | Array de IDs de `User` que denunciaram. | Moderação |
| `moderado` | `Boolean` | Indica se o comentário foi revisado/aprovado. | Moderação |

## 4. Estrutura de Diretórios Proposta

A estrutura de diretórios para o projeto Node.js (Express) seguirá o padrão MVC (Model-View-Controller) adaptado para uma API, com foco na modularidade.

```
/backend_hub_juventude
├── node_api/
│   ├── node_modules/
│   ├── src/
│   │   ├── config/             # Configurações de ambiente, DB, JWT
│   │   ├── models/             # Definições de Schemas (Mongoose)
│   │   ├── controllers/        # Lógica de negócio (o que fazer)
│   │   ├── routes/             # Definição de rotas da API (como acessar)
│   │   ├── middlewares/        # Funções de interceptação (auth, validação)
│   │   ├── services/           # Lógica de serviços externos (email, upload)
│   │   └── app.js              # Ponto de entrada da aplicação
│   ├── .env.example
│   ├── package.json
│   └── README.md
├── python_data_service/
│   ├── venv/
│   ├── data_processor.py       # Script para relatórios/análise (usa PyMongo)
│   ├── requirements.txt
│   └── README.md
└── DOCUMENTACAO_BACKEND.md     # Este documento
```

## 5. Plano de Desenvolvimento (Próximos Passos)

O desenvolvimento do backend será dividido em módulos principais, que podem ser implementados sequencialmente.

| Módulo | Descrição | Tecnologias Envolvidas |
| :--- | :--- | :--- |
| **Módulo 1: Configuração e Usuários** | Configuração do ambiente Node.js/Express/MongoDB. Implementação completa do CRUD de `User`, incluindo cadastro (e-mail/senha), login, criptografia de senha (`bcrypt`), e rotas de autenticação (`JWT`). | Node.js, Express, Mongoose, bcrypt, JWT, Passport.js |
| **Módulo 2: Gerenciamento de Conteúdo** | Implementação do CRUD de `Content`. Criação de rotas protegidas por nível de acesso (`Admin`, `Editor`). Lógica de upload de imagens (simulação de URL de S3/Cloudinary). | Node.js, Express, Mongoose, Middlewares de Auth/Permissão |
| **Módulo 3: Feed e Interação** | Implementação das rotas de leitura do feed (cronológico, filtros, pesquisa). Implementação do CRUD de `Comment` e da lógica de "curtir" (`Content`). | Node.js, Express, Mongoose |
| **Módulo 4: Moderação e Admin** | Implementação da lógica de moderação de comentários (filtro de palavras-chave, denúncias). Criação de rotas para gerenciamento de usuários (bloqueio, alteração de nível de acesso). | Node.js, Express, Mongoose |
| **Módulo 5: Serviço de Dados (PyMongo)** | Criação do ambiente Python. Desenvolvimento do script `data_processor.py` utilizando **PyMongo** para se conectar ao MongoDB e gerar os relatórios de métricas de sucesso (usuários ativos, engajamento). | Python, PyMongo, MongoDB |

## 6. Sugestões de Bibliotecas (Node.js)

Para iniciar o projeto Node.js (`node_api/`), as seguintes bibliotecas são recomendadas:

| Biblioteca | Uso | Comando de Instalação |
| :--- | :--- | :--- |
| `express` | Framework web principal. | `npm install express` |
| `mongoose` | ODM para MongoDB. | `npm install mongoose` |
| `dotenv` | Gerenciamento de variáveis de ambiente. | `npm install dotenv` |
| `bcrypt` | Criptografia de senhas. | `npm install bcrypt` |
| `jsonwebtoken` | Geração e validação de JWT. | `npm install jsonwebtoken` |
| `passport` | Middleware de autenticação. | `npm install passport` |
| `passport-jwt` | Estratégia JWT para Passport. | `npm install passport-jwt` |
| `helmet` | Segurança da API (HTTP headers). | `npm install helmet` |
| `cors` | Gerenciamento de CORS. | `npm install cors` |

Para o serviço de dados Python (`python_data_service/`), as seguintes bibliotecas são necessárias:

| Biblioteca | Uso | Comando de Instalação |
| :--- | :--- | :--- |
| `pymongo` | Driver oficial para MongoDB. | `pip install pymongo` |
| `python-dotenv` | Gerenciamento de variáveis de ambiente. | `pip install python-dotenv` |

[1]: https://nodejs.org/en/docs/guides/getting-started "Node.js Official Documentation"
[2]: https://www.mongodb.com/docs/drivers/node/current/ "MongoDB Node.js Driver Documentation"
[3]: https://www.mongodb.com/docs/drivers/pymongo/ "PyMongo Official Documentation"
[4]: https://expressjs.com/ "Express.js Official Website"
[5]: https://mongoosejs.com/ "Mongoose Official Website"
[6]: https://www.npmjs.com/package/passport "Passport.js Official Documentation"
[7]: https://www.npmjs.com/package/bcrypt "bcrypt Official Documentation"
[8]: https://jwt.io/ "JSON Web Tokens (JWT) Official Website"
[9]: https://www.npmjs.com/package/helmet "Helmet Official Documentation"
[10]: https://www.npmjs.com/package/cors "CORS Official Documentation"
[11]: https://pypi.org/project/python-dotenv/ "python-dotenv PyPI"
[12]: https://pypi.org/project/pymongo/ "PyMongo PyPI"

## 7. Referências

[1] Node.js Official Documentation
[2] MongoDB Node.js Driver Documentation
[3] PyMongo Official Documentation
[4] Express.js Official Website
[5] Mongoose Official Website
[6] Passport.js Official Documentation
[7] bcrypt Official Documentation
[8] JSON Web Tokens (JWT) Official Website
[9] Helmet Official Documentation
[10] CORS Official Documentation
[11] python-dotenv PyPI
[12] PyMongo PyPI
