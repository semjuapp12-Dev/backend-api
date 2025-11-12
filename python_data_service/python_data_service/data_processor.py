# data_processor.py
# Script de processamento de dados usando PyMongo

import os
from dotenv import load_dotenv
from pymongo import MongoClient

# Carrega variáveis de ambiente
load_dotenv()

# Configuração do MongoDB (usando a mesma URI do projeto Node.js)
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/hub_juventude_db")

def generate_user_report():
    """
    Exemplo de função para gerar um relatório de usuários usando PyMongo.
    """
    try:
        client = MongoClient(MONGO_URI)
        db = client.get_database() # Obtém o banco de dados padrão da URI
        
        # Acessa a coleção de usuários (assumindo o nome 'users')
        users_collection = db.users
        
        total_users = users_collection.count_documents({})
        
        print(f"Conexão com MongoDB estabelecida com sucesso.")
        print(f"Total de usuários cadastrados: {total_users}")
        
        # Exemplo de agregação para contar usuários por área de interesse
        pipeline = [
            {"$unwind": "$areasInteresse"},
            {"$group": {"_id": "$areasInteresse", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        
        print("\nUsuários por Área de Interesse:")
        for result in users_collection.aggregate(pipeline):
            print(f"- {result['_id']}: {result['count']}")
            
    except Exception as e:
        print(f"Erro ao conectar ou processar dados: {e}")
    finally:
        if 'client' in locals():
            client.close()

if __name__ == "__main__":
    print("Iniciando o processamento de dados com PyMongo...")
    generate_user_report()
    print("Processamento concluído.")
