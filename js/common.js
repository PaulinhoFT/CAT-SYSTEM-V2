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

    // --- Lógica de Autenticação ---
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const loginModal = document.getElementById('login-modal');
    const closeLoginBtn = document.getElementById('close-login');
    const loginForm = document.getElementById('login-form');
    const addProcedureLink = document.getElementById('add-procedure-link');
    const loginError = document.getElementById('login-error');

    if (loginBtn && loginModal) {
        loginBtn.addEventListener('click', () => {
            loginModal.classList.remove('hidden');
        });
    }

    if (closeLoginBtn && loginModal) {
        closeLoginBtn.addEventListener('click', () => {
            loginModal.classList.add('hidden');
            if (loginError) loginError.classList.add('hidden');
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            auth.signInWithEmailAndPassword(email, password)
                .then(() => {
                    loginModal.classList.add('hidden');
                    loginForm.reset();
                })
                .catch((error) => {
                    if (loginError) {
                        loginError.textContent = "Erro: " + error.message;
                        loginError.classList.remove('hidden');
                    }
                });
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            auth.signOut();
        });
    }

    // Monitorar estado de autenticação
    if (typeof auth !== 'undefined') {
        auth.onAuthStateChanged((user) => {
            if (user) {
                if (loginBtn) loginBtn.classList.add('hidden');
                if (logoutBtn) logoutBtn.classList.remove('hidden');
                if (addProcedureLink) addProcedureLink.classList.remove('hidden');
                document.body.classList.add('is-admin');
            } else {
                if (loginBtn) loginBtn.classList.remove('hidden');
                if (logoutBtn) logoutBtn.classList.add('hidden');
                if (addProcedureLink) addProcedureLink.classList.add('hidden');
                document.body.classList.remove('is-admin');
            }
        });
    }
});
