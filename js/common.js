document.addEventListener('DOMContentLoaded', () => {
    // --- Lógica para o modo claro/escuro ---
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }

    const updateThemeButtons = () => {
        const isDark = document.body.classList.contains('dark-mode');
        const themeToggles = document.querySelectorAll('#theme-toggle, .theme-toggle-trigger');
        themeToggles.forEach(btn => {
            if (btn.tagName === 'A' || btn.tagName === 'BUTTON') {
                if (isDark) {
                    btn.innerHTML = btn.innerHTML.includes('<i') ? btn.innerHTML.replace('fa-moon', 'fa-sun') : '☀️';
                } else {
                    btn.innerHTML = btn.innerHTML.includes('<i') ? btn.innerHTML.replace('fa-sun', 'fa-moon') : '🌙';
                }
            }
        });
    };

    updateThemeButtons();

    window.toggleTheme = () => {
        document.body.classList.toggle('dark-mode');
        const theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
        localStorage.setItem('theme', theme);
        updateThemeButtons();
    };

    document.addEventListener('click', (e) => {
        if (e.target.closest('#theme-toggle') || e.target.closest('.theme-toggle-trigger')) {
            e.preventDefault();
            window.toggleTheme();
        }
    });

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
    const isAdminPage = window.location.pathname.includes('admin') || window.location.pathname.includes('add-procedure.html');
    if (!sessionStorage.getItem('welcomeModalShown') && !isAdminPage) {
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

    // Injetar Modal de Login se não existir
    if (!document.getElementById('login-modal')) {
        const loginModalHTML = `
            <div id="login-modal" class="modal-overlay hidden">
                <div class="modal-container">
                    <div class="modal-titlebar">
                        <span>Painel Administrativo</span>
                        <button class="modal-close" id="close-login">&times;</button>
                    </div>
                    <div class="modal-content">
                        <div class="login-header">
                            <span style="font-size: 3rem;">🔐</span>
                            <h2>Bem-vindo</h2>
                            <p>Identifique-se para gerenciar procedimentos</p>
                        </div>
                        <form id="login-form">
                            <div class="form-group">
                                <label for="login-email">E-mail</label>
                                <input type="email" id="login-email" placeholder="seu@email.com" required>
                            </div>
                            <div class="form-group">
                                <label for="login-password">Senha</label>
                                <input type="password" id="login-password" placeholder="••••••••" required>
                            </div>
                            <button type="submit" id="btn-do-login">Acessar Painel</button>
                            <p id="login-error" class="red hidden" style="margin-top: 15px; text-align: center; font-size: 0.85rem; padding: 10px; background: rgba(239, 68, 68, 0.1); border-radius: 8px;"></p>
                        </form>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', loginModalHTML);
    }

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
            console.log("Iniciando tentativa de login...");
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const submitBtn = document.getElementById('btn-do-login');

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "Acessando...";
            }

            if (loginError) loginError.classList.add('hidden');

            auth.signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    console.log("Login bem-sucedido:", userCredential.user.email);
                    loginModal.classList.add('hidden');
                    loginForm.reset();
                    // Redirecionar para o painel administrativo após o login
                    window.location.href = 'admin.html';
                })
                .catch((error) => {
                    console.error("Erro no login:", error.code, error.message);
                    if (loginError) {
                        loginError.textContent = "Erro: " + error.message;
                        loginError.classList.remove('hidden');
                    } else {
                        alert("Erro no login: " + error.message);
                    }
                })
                .finally(() => {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = "Acessar Painel";
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
            const isLoginPage = window.location.pathname.includes('admin') || 
                                window.location.pathname.includes('add-procedure.html');

            if (user) {
                if (loginBtn) loginBtn.classList.add('hidden');
                if (logoutBtn) logoutBtn.classList.remove('hidden');
                if (addProcedureLink) {
                    addProcedureLink.classList.remove('hidden');
                    addProcedureLink.textContent = 'Painel Administrativo';
                    addProcedureLink.href = 'admin.html';
                }
                document.body.classList.add('is-admin');
            } else {
                if (loginBtn) loginBtn.classList.remove('hidden');
                if (logoutBtn) logoutBtn.classList.add('hidden');
                if (addProcedureLink) {
                    addProcedureLink.classList.add('hidden');
                }
                document.body.classList.remove('is-admin');
                
                // Redirecionar se estiver em uma página administrativa e não estiver logado
                if (isLoginPage && !window.location.pathname.includes('index.html')) {
                    window.location.href = 'index.html'; 
                }
            }
        });
    }
});

const logActivity = (action, title, category) => {
    return db.collection('activity_logs').add({
        action: action,
        title: title,
        category: category,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
};
