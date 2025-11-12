# Hub da Juventude - Serviço de Processamento de Dados (PyMongo)

Este diretório contém scripts e ferramentas desenvolvidas em Python para interagir com o banco de dados MongoDB, focando principalmente em tarefas de processamento de dados, análise e geração de relatórios, conforme a exigência de uso do **PyMongo**.

## 🚀 Tecnologias

*   **Python**
*   **PyMongo**
*   **python-dotenv**

## 🛠️ Configuração e Instalação

1.  **Crie e ative um ambiente virtual:**
    \`\`\`bash
    pythonvenv\Scripts\activate
 -m venv venv
    source venv/bin/activate
    \`\`\`

2.  **Instale as dependências:**
    \`\`\`bash
    pip install -r requirements.txt
    \`\`\`

3.  **Configuração do Ambiente:**
    Crie um arquivo `.env` neste diretório para armazenar a string de conexão do MongoDB, se necessário, ou utilize a mesma do projeto Node.js.

## 📝 Scripts Principais

*   \`data_processor.py\`: Script principal para se conectar ao MongoDB via PyMongo e executar tarefas como:
    *   Geração de relatórios de usuários ativos (MAU).
    *   Análise de engajamento de conteúdo (curtidas, comentários).
    *   Extração de dados demográficos.

## 🏃 Execução

Para executar o script de processamento de dados:

\`\`\`bash
python data_processor.py
\`\`\`
