document.addEventListener('DOMContentLoaded', () => {
    const downdetectorContainer = document.getElementById('downdetector-container');
    const apiError = document.getElementById('api-error');

    // Configurações da API (Placeholder pois o usuário não forneceu o Client Secret)
    // O usuário disse que não tem ainda, então vamos tentar usar o endpoint de busca ou similar
    // que possa retornar algo sem autenticação, ou mostrar uma mensagem clara.
    // Mas o pedido foi para implementar a API do downdetector v2.
    const API_CLIENT_SECRET = '';
    const NTFY_TOPIC = 'downs';

    // Lista de empresas populares no Brasil para monitorar se a API geral falhar ou requerer IDs específicos
    const popularCompaniesBR = [
        { name: 'WhatsApp', id: 42207 },
        { name: 'Instagram', id: 42203 },
        { name: 'Facebook', id: 42201 },
        { name: 'YouTube', id: 42211 },
        { name: 'Netflix', id: 42205 },
        { name: 'Gmail', id: 42209 },
        { name: 'Nubank', id: 44342 },
        { name: 'Itaú', id: 44336 },
        { name: 'Bradesco', id: 44338 },
        { name: 'Santander', id: 44340 },
        { name: 'Claro', id: 44324 },
        { name: 'Vivo', id: 44322 },
        { name: 'Tim', id: 44326 },
        { name: 'Oi', id: 44328 },
        { name: 'Mercado Livre', id: 44344 },
        { name: 'Amazon', id: 42213 },
        { name: 'Twitter (X)', id: 42215 },
        { name: 'Telegram', id: 42217 },
        { name: 'Pix', id: 44346 },
        { name: 'Gov.br', id: 44348 }
    ];

    async function fetchOutages() {
        try {
            // Agora buscamos direto do Firestore (alimentado pelo scraper Python)
            const snapshot = await db.collection('service_outages')
                                     .orderBy('updated', 'desc')
                                     .limit(20)
                                     .get();

            const outages = [];
            snapshot.forEach(doc => outages.push(doc.data()));

            if (outages.length === 0) {
                // Se o Firestore estiver vazio, mostra que o scraper ainda não rodou
                downdetectorContainer.innerHTML = `
                    <div class="api-notice">
                        <i class="fa fa-info-circle"></i>
                        Aguardando dados do Scraper. Execute 'python3 downdetector_scraper.py' no servidor.
                    </div>
                `;
                return;
            }

            renderOutages(outages);
        } catch (error) {
            console.error('Erro ao buscar dados do Firestore:', error);
            apiError.classList.remove('hidden');
            downdetectorContainer.innerHTML = '';
        }
    }

    function renderOutages(outages) {
        downdetectorContainer.innerHTML = '';

        if (outages.length === 0) {
            downdetectorContainer.innerHTML = '<div class="no-outages">Todos os sistemas operando normalmente.</div>';
            return;
        }

        outages.forEach(outage => {
            const card = document.createElement('div');
            card.className = 'downdetector-card';

            const statusClass = outage.impact >= 2 ? 'status-critical' : 'status-warning';
            const statusText = outage.impact >= 2 ? 'Muitos Relatos' : 'Alguns Relatos';
            const lastUpdated = outage.updated ? new Date(outage.updated * 1000).toLocaleTimeString() : 'N/A';

            card.innerHTML = `
                <div class="card-header-dd">
                    <h3>${outage.name || 'Serviço'}</h3>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
                <div class="card-body-dd">
                    <p>${outage.status || 'Relatos recentes indicam possíveis problemas.'}</p>
                    <small>Última atualização: ${lastUpdated}</small>
                </div>
            `;
            downdetectorContainer.appendChild(card);
        });
    }


    // Inicializar
    fetchOutages();
    // Atualizar a cada 1 minuto para tempo real
    setInterval(fetchOutages, 1 * 60 * 1000);
});
