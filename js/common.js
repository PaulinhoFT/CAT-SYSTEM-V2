document.addEventListener('DOMContentLoaded', () => {
    // --- Lógica para o modo claro/escuro ---
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const currentTheme = localStorage.getItem('theme');

        if (currentTheme === 'dark') {
            document.body.classList.add('dark-mode');
            themeToggle.textContent = '☀️';
        }

        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            let theme = 'light';
            if (document.body.classList.contains('dark-mode')) {
                theme = 'dark';
                themeToggle.textContent = '☀️';
            } else {
                themeToggle.textContent = '🌙';
            }
            localStorage.setItem('theme', theme);
        });
    }

    // --- Lógica para o Rádio Player ---

    // Injetar HTML do Rádio se não existir
    if (!document.getElementById('radio-player-container')) {
        const radioHTML = `
            <div id="radio-player-container" class="radio-widget hidden">
                <div class="radio-titlebar">
                    <span>Rádio Ubatuba</span>
                    <button id="close-radio" class="radio-close">X</button>
                </div>
                <div class="radio-content">
                    <iframe src="https://player.xcast.com.br/player-topo-html5-2/8444/1/3e1c63/941449/941449///"
                            width="100%" height="100" frameborder="0"></iframe>
                </div>
            </div>
            <button id="toggle-radio" class="radio-toggle-btn" title="Ouvir Rádio Ubatuba">Rádio 📻</button>
        `;
        document.body.insertAdjacentHTML('beforeend', radioHTML);
    }

    const radioContainer = document.getElementById('radio-player-container');
    const toggleRadioBtn = document.getElementById('toggle-radio');
    const closeRadioBtn = document.getElementById('close-radio');

    if (toggleRadioBtn && radioContainer) {
        toggleRadioBtn.addEventListener('click', () => {
            radioContainer.classList.remove('hidden');
            toggleRadioBtn.classList.add('hidden');
        });
    }

    if (closeRadioBtn && radioContainer) {
        closeRadioBtn.addEventListener('click', () => {
            radioContainer.classList.add('hidden');
            toggleRadioBtn.classList.remove('hidden');
        });
    }

    // --- Lógica para o Modal de Boas-vindas ---
    if (!sessionStorage.getItem('welcomeModalShown')) {
        const modalHTML = `
            <div id="welcome-modal" class="modal-overlay">
                <div class="modal-container">
                    <div class="modal-titlebar">
                        <span>Meta 2026</span>
                        <button id="close-modal" class="modal-close">X</button>
                    </div>
                    <div class="modal-content">
                        <img src="img/meta.jpg" alt="Meta 2026">
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const modal = document.getElementById('welcome-modal');
        const closeModalBtn = document.getElementById('close-modal');

        const closeModal = () => {
            if (modal) {
                modal.style.opacity = '0';
                modal.style.pointerEvents = 'none';
                setTimeout(() => {
                    modal.classList.add('hidden');
                    sessionStorage.setItem('welcomeModalShown', 'true');
                }, 300);
            }
        };

        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', closeModal);
        }

        // Fechar ao clicar fora do modal
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal();
                }
            });
        }
    }
});
