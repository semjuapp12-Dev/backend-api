# Hub da Juventude - Backend Completo

##  Execução Rápida (Quick Start)

Assumindo que você já descompactou o projeto e instalou o Node.js e o MongoDB:

1.  **Clone o repositório:**
    \`\`\`bash
    git clone <URL_DO_SEU_REPOSITORIO>
    cd hub-da-juventude-api/node_api
    \`\`\`

2.  **Configure o Ambiente:** Crie e edite o arquivo `.env` no diretório `node_api/`.

3.  **Instale as Dependências:**
    ```bash
    cd node_api
    npm install
    ```
4.  **Inicie o Servidor:**
    ```bash
    npm run dev
    ```
    O servidor da API estará rodando em `http://localhost:3000`.

---

##  Tecnologias Utilizadas

Este repositório contém o backend completo para o aplicativo "Hub da Juventude", desenvolvido em uma arquitetura modular que utiliza **Node.js** para a API principal e **Python/PyMongo** para o serviço de processamento de dados.

##  Tecnologias Utilizadas

| Componente | Tecnologia | Uso Principal |
| :--- | :--- | :--- |
| **API Principal** | Node.js (Express.js) | Servidor RESTful para todas as funcionalidades do aplicativo (CRUD, Autenticação, Interação, Admin). |
| **Banco de Dados** | MongoDB (via Mongoose) | Banco de dados NoSQL para armazenamento de todos os dados do aplicativo. |
| **Autenticação** | JWT, bcrypt, Passport.js | Segurança e controle de acesso às rotas. |
| **Serviço de Dados** | Python (PyMongo) | Script para tarefas de análise e geração de relatórios, conforme a exigência de uso do PyMongo. |

##  Estrutura do Projeto

O projeto é dividido em dois diretórios principais:

```
/backend_hub_juventude
├── node_api/             # Contém a API principal em Node.js
│   ├── src/              # Código-fonte da API (Controllers, Models, Routes, etc.)
│   ├── package.json      # Dependências do Node.js
│   └── .env.example      # Exemplo de variáveis de ambiente
├── python_data_service/  # Contém o serviço de dados em Python
│   ├── data_processor.py # Script de exemplo usando PyMongo
│   └── requirements.txt  # Dependências do Python
└── README_COMPLETO.md    # Este arquivo
```

##  Guia de Configuração e Execução (Ordem Sequencial)

Siga os passos abaixo para configurar e executar o backend completo.

### Passo 1: Configuração e Execução da API Node.js (Backend Principal)

Esta é a parte principal do backend e deve ser configurada primeiro.

#### 1.1. Pré-requisitos
*   Node.js (v18+)
*   MongoDB Server (rodando localmente ou em um serviço cloud)

#### 1.2. Instalação de Dependências

Navegue até o diretório da API e instale as dependências:

```bash
cd node_api
npm install
```

#### 1.3. Configuração do Ambiente (`.env`)

Crie o arquivo `.env` na raiz do diretório `node_api/` baseado no `.env.example` e preencha as variáveis de ambiente, especialmente a `MONGO_URI` e a `JWT_SECRET`.

```bash
cp .env.example .env
# Edite o arquivo .env
```

**Importante:** Certifique-se de que a `MONGO_URI` aponte para a sua instância do MongoDB.

#### 1.4. Execução do Servidor

Inicie o servidor da API. O `nodemon` irá monitorar as mudanças no código.

```bash
npm run dev
```

Se o servidor iniciar com sucesso, você verá a mensagem de conexão com o MongoDB e o servidor rodando (ex: `Servidor rodando em http://localhost:3000`).

### Passo 2: Configuração e Execução do Serviço de Dados Python (PyMongo)

Este serviço utiliza o mesmo banco de dados MongoDB e é um exemplo de como usar o PyMongo para tarefas de análise.

#### 2.1. Pré-requisitos
*   Python (v3.8+)

#### 2.2. Configuração do Ambiente Virtual

Navegue até o diretório do serviço Python e crie um ambiente virtual (recomendado):

```bash
cd ../python_data_service
python3 -m venv venv
```

Ative o ambiente virtual:

```bash
# Para Linux/Mac
source venv/bin/activate

# Para Windows
venv\Scripts\activate
```

#### 2.3. Instalação de Dependências

Instale as dependências listadas no `requirements.txt`:

```bash
pip install -r requirements.txt
```

#### 2.4. Execução do Script de Processamento

Você pode executar o script de exemplo `data_processor.py` para testar a conexão do PyMongo com o MongoDB:

```bash
python data_processor.py
```

**Nota:** Este script lerá os dados do mesmo banco de dados que a API Node.js está utilizando.

---

Com esses passos, você terá o backend principal (Node.js) e o serviço de dados (Python/PyMongo) configurados e prontos para uso.
