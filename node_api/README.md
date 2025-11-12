# Hub da Juventude - API

Esta é a API RESTful principal para o aplicativo "Hub da Juventude", desenvolvida em Node.js com o framework Express e utilizando MongoDB como banco de dados.

## 🚀 Tecnologias

*   **Node.js**
*   **Express.js**
*   **MongoDB** (via Mongoose)
*   **JWT** (JSON Web Tokens) para autenticação
*   **bcrypt** para criptografia de senhas

## 🛠️ Configuração e Instalação

1.  **Clone o repositório:**
    \`\`\`bash
    git clone <URL_DO_SEU_REPOSITORIO>
    cd hub-da-juventude-api/node_api
    \`\`\`

2.  **Instale as dependências:**
    \`\`\`bash
    npm install
    \`\`\`

3.  **Configuração do Ambiente:**
    Crie um arquivo `.env` na raiz do diretório `node_api/` baseado no `.env.example` e preencha as variáveis de ambiente, especialmente a `MONGO_URI` e a `JWT_SECRET`.

    \`\`\`bash
    cp .env.example .env
    # Edite o arquivo .env
    \`\`\`

4.  **Execução:**

    *   **Modo de Desenvolvimento (com nodemon):**
        \`\`\`bash
        npm run dev
        \`\`\`

    *   **Modo de Produção:**
        \`\`\`bash
        npm start
        \`\`\`

## 📂 Estrutura do Projeto

A estrutura segue um padrão modular para facilitar a manutenção e escalabilidade:

\`\`\`
src/
├── config/             # Configurações de ambiente, DB, JWT
├── models/             # Definições de Schemas (Mongoose)
├── controllers/        # Lógica de negócio (o que fazer)
├── routes/             # Definição de rotas da API (como acessar)
├── middlewares/        # Funções de interceptação (auth, validação)
├── services/           # Lógica de serviços externos (email, upload)
└── app.js              # Ponto de entrada da aplicação
\`\`\`
