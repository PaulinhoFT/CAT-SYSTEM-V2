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
        if (!API_CLIENT_SECRET) {
            showDemoData();
            return;
        }

        try {
            // Exemplo de chamada para a API v2 (ajustar conforme documentação real se disponível)
            // Geralmente requer autenticação Bearer
            const response = await fetch('https://downdetectorapi.com/v2/incidents?country_iso=BR&limit=20', {
                headers: {
                    'Authorization': `Bearer ${API_CLIENT_SECRET}`
                }
            });

            if (!response.ok) throw new Error('Falha na API');

            const data = await response.json();
            renderOutages(data.incidents || []);
            checkAndNotify(data.incidents || []);
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
            apiError.classList.remove('hidden');
            downdetectorContainer.innerHTML = '';
        }
    }

    function renderOutages(incidents) {
        downdetectorContainer.innerHTML = '';

        if (incidents.length === 0) {
            downdetectorContainer.innerHTML = '<div class="no-outages">Todos os sistemas operando normalmente.</div>';
            return;
        }

        incidents.forEach(incident => {
            const card = document.createElement('div');
            card.className = 'downdetector-card';

            const statusClass = incident.user_impact >= 2 ? 'status-critical' : 'status-warning';
            const statusText = incident.user_impact >= 2 ? 'Muitos Relatos' : 'Alguns Relatos';

            card.innerHTML = `
                <div class="card-header-dd">
                    <h3>${incident.company_name || 'Serviço'}</h3>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
                <div class="card-body-dd">
                    <p>Relatos recentes indicam possíveis problemas.</p>
                    <small>Última atualização: ${new Date().toLocaleTimeString()}</small>
                </div>
            `;
            downdetectorContainer.appendChild(card);
        });
    }

    // Função de demonstração ou fallback quando não há API Key
    function showDemoData() {
        downdetectorContainer.innerHTML = `
            <div class="api-notice">
                <i class="fa fa-info-circle"></i>
                API Key (Client Secret) não configurada. Exibindo dados de exemplo.
            </div>
        `;

        const demoIncidents = [
            { company_name: 'WhatsApp', user_impact: 2 },
            { company_name: 'Instagram', user_impact: 1 },
            { company_name: 'Claro', user_impact: 2 },
            { company_name: 'Nubank', user_impact: 1 }
        ];

        renderOutages(demoIncidents);
        checkAndNotify(demoIncidents);
    }

    const notifiedOutages = new Set();

    function checkAndNotify(incidents) {
        incidents.forEach(incident => {
            if (incident.user_impact >= 2 && !notifiedOutages.has(incident.company_name)) {
                sendNtfyNotification(incident.company_name);
                notifiedOutages.add(incident.company_name);
            }
        });
    }

    async function sendNtfyNotification(companyName) {
        try {
            await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
                method: 'POST',
                body: `Alerta: Muitas reclamações detectadas para ${companyName} no DownDetector!`,
                headers: {
                    'Title': 'Sistema Fora!',
                    'Priority': 'high',
                    'Tags': 'warning,disappointed'
                }
            });
            console.log(`Notificação enviada para ${companyName}`);
        } catch (error) {
            console.error('Erro ao enviar notificação ntfy:', error);
        }
    }

    // Inicializar
    fetchOutages();
    // Atualizar a cada 5 minutos
    setInterval(fetchOutages, 5 * 60 * 1000);
});
