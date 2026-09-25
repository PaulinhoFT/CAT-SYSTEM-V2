import json
from firestore_client import FirestoreClient

client = FirestoreClient()
procs = client.get_procedures()

with open('dump_cat_system.txt', 'w', encoding='utf-8') as f:
    f.write("=================================================\n")
    f.write("BASE DE CONHECIMENTO INTERNA (CAT SYSTEM V2)\n")
    f.write("=================================================\n\n")
    
    for p in procs:
        f.write(f"--- {p.get('title', 'Sem Titulo').upper()} ---\n")
        f.write(f"Categoria: {p.get('category', 'Geral')}\n")
        f.write(f"{p.get('content', '')}\n\n")

print(f"Exportados {len(procs)} procedimentos com sucesso.")
