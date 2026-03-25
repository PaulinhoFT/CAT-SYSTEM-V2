from playwright.sync_api import sync_playwright
import time
import json
import firebase_admin
from firebase_admin import credentials, firestore
import os
import requests

# Inicializar Firebase Admin (usando service account se disponível ou credenciais padrão)
# No sandbox, as vezes temos o serviceAccountKey.json
def init_firebase():
    if not firebase_admin._apps:
        cred_path = os.environ.get('FIREBASE_SERVICE_ACCOUNT_KEY_PATH', 'serviceAccountKey.json')
        if os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
        else:
            # Fallback se não houver arquivo (pode falhar se não houver auth)
            firebase_admin.initialize_app()
    return firestore.client()

def scrape_downdetector():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Contexto com user agent comum
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
        )
        page = context.new_page()

        print("Acessando DownDetector Brasil...")
        try:
            # Aumentar timeout e esperar apenas domcontentloaded
            page.goto("https://downdetector.com.br/", wait_until="domcontentloaded", timeout=60000)

            # Esperar um pouco para carregar os cards (estáticos ou via JS leve)
            time.sleep(10)

            # Tentar extrair os top 20
            # A estrutura do site tem um container principal de "empresas em destaque"

            results = []

            # Seletor para os cards de empresas na home
            # Geralmente são elementos com classe que indica perigo/status
            cards = page.query_selector_all(".company-card")
            if not cards:
                # Tentar seletor alternativo (links dentro de listas de status)
                cards = page.query_selector_all("div.card-body a[href^='/status/']")

            for card in cards[:20]:
                try:
                    name_el = card.query_selector("span") or card
                    name = name_el.inner_text().strip().split('\n')[0]

                    # O status pode estar em uma classe ou texto
                    # Ex: "Possíveis problemas", "Muitos problemas", "Não há problemas"
                    status_text = card.inner_text().strip()

                    impact = 0 # 0: Normal, 1: Warning, 2: Critical
                    if "Muitos problemas" in status_text or "Muitas reclamações" in status_text:
                        impact = 2
                    elif "Possíveis problemas" in status_text or "Possíveis reclamações" in status_text:
                        impact = 1

                    results.append({
                        "name": name,
                        "status": status_text,
                        "impact": impact,
                        "updated": time.time()
                    })
                except Exception as e:
                    print(f"Erro ao processar card: {e}")

            browser.close()
            return results
        except Exception as e:
            print(f"Erro no scraping: {e}")
            browser.close()
            return []

def update_firestore(data):
    db = init_firebase()
    batch = db.batch()

    # Referência para a coleção
    outages_ref = db.collection('service_outages')

    # Primeiro, limpar os antigos (opcional, ou apenas sobrescrever)
    # Aqui vamos usar o nome como ID para atualizar se já existir
    for item in data:
        doc_id = item['name'].replace('/', '_').replace(' ', '_').lower()
        doc_ref = outages_ref.document(doc_id)
        batch.set(doc_ref, item)

        # Se for impacto crítico, enviar notificação ntfy
        if item['impact'] == 2:
            send_ntfy(item['name'])

    batch.commit()
    print(f"Firestore atualizado com {len(data)} itens.")

def send_ntfy(company_name):
    try:
        topic = "downs"
        requests.post(f"https://ntfy.sh/{topic}",
            data=f"Alerta: Muitas reclamações detectadas para {company_name} no DownDetector!".encode('utf-8'),
            headers={
                "Title": "Sistema Fora!",
                "Priority": "high",
                "Tags": "warning,disappointed"
            })
        print(f"Notificação enviada para {company_name}")
    except Exception as e:
        print(f"Erro ntfy: {e}")

if __name__ == "__main__":
    outages = scrape_downdetector()
    if outages:
        print(f"Scraped {len(outages)} companies.")
        try:
            update_firestore(outages)
        except Exception as e:
            print(f"Erro ao salvar no Firestore: {e}. Certifique-se de que as credenciais estão configuradas.")
            # Salvar em arquivo local para debug
            with open('outages_debug.json', 'w') as f:
                json.dump(outages, f)
    else:
        print("Nenhum dado capturado.")
