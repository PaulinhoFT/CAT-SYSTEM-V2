document.addEventListener('DOMContentLoaded', () => {
    // --- Injeção do Navbar ---
    const navbars = document.querySelectorAll('.navbar');
    if (navbars.length > 0) {
        const isHome = window.location.pathname === '/' || window.location.pathname.endsWith('index.html');
        const navbarHTML = `
            <ul>
                <li>
                    ${isHome ? '' : '<a href="index.html">Página Inicial</a>'}
                    ${isHome ? '' : '<a href="att.html">Abertura de ATT</a>'}
                    ${isHome ? '' : '<a href="pre-registros.html">Pré Registros</a>'}
                    ${isHome ? '' : '<a href="formatador.html" target="_blank" rel="noopener noreferrer">Formatador de Registro</a>'}
                    ${isHome ? '' : '<a href="calculadora.html" target="_blank" rel="noopener noreferrer">Calcu. de desconto</a>'}
                    <a href="admin.html" id="add-procedure-link" class="hidden">Painel Administrativo</a>
                    <button id="login-btn" class="spell-pop-btn">Entrar</button>
                    <button id="logout-btn" class="hidden spell-pop-btn">Sair</button>
                    <button id="theme-toggle" class="spell-pop-btn" title="Alternar tema"><i class="fa-solid fa-moon"></i></button>
                </li>
            </ul>
        `;
        navbars.forEach(nav => {
            nav.innerHTML = navbarHTML;
        });
    }

    // --- Lógica para o modo claro/escuro (Padrão: Cinza bem fraquinho #f3f4f6) ---
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }

    const updateThemeButtons = () => {
        const isDark = document.body.classList.contains('dark-mode');
        const themeToggles = document.querySelectorAll('#theme-toggle, .theme-toggle-trigger');
        themeToggles.forEach(btn => {
            if (btn.tagName === 'A' || btn.tagName === 'BUTTON') {
                btn.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
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

    // --- Lógica de Autenticação ---

    // Injetar Modal de Login se não existir (Spell UI Modal)
    if (!document.getElementById('login-modal')) {
        const loginModalHTML = `
            <div id="login-modal" class="modal-overlay hidden">
                <div class="modal-container spell-login-container">
                    <button class="modal-close spell-modal-close" id="close-login" aria-label="Fechar" title="Fechar">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                    <div class="spell-login-content">
                        <div class="spell-login-header">
                            <h2 class="spell-login-title">Painel Administrativo</h2>
                            <p class="spell-login-subtitle">Identifique-se para gerenciar os procedimentos</p>
                        </div>
                        <form id="login-form" class="spell-login-form">
                            <div class="spell-form-group">
                                <label for="login-email" class="spell-form-label">E-mail</label>
                                <div class="spell-input-wrapper">
                                    <i class="fa-regular fa-envelope spell-input-icon"></i>
                                    <input type="email" id="login-email" class="spell-input" placeholder="seu@email.com" required autocomplete="username">
                                </div>
                            </div>
                            <div class="spell-form-group">
                                <label for="login-password" class="spell-form-label">Senha</label>
                                <div class="spell-input-wrapper">
                                    <i class="fa-regular fa-lock spell-input-icon"></i>
                                    <input type="password" id="login-password" class="spell-input" placeholder="••••••••" required autocomplete="current-password">
                                </div>
                            </div>
                            <button type="submit" id="btn-do-login" class="spell-pop-btn spell-login-submit">
                                <span>Acessar Painel</span>
                                <i class="fa-solid fa-arrow-right"></i>
                            </button>
                            <p id="login-error" class="red hidden spell-login-error"></p>
                        </form>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', loginModalHTML);
    }

    const setupLoginEvents = () => {
        const loginBtn = document.getElementById('login-btn');
        const logoutBtn = document.getElementById('logout-btn');
        const loginModal = document.getElementById('login-modal');
        const closeLoginBtn = document.getElementById('close-login');
        const loginForm = document.getElementById('login-form');
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

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                auth.signOut();
            });
        }

        if (loginForm) {
            loginForm.removeEventListener('submit', loginHandler);
            loginForm.addEventListener('submit', loginHandler);
        }
    };

    const loginHandler = (e) => {
            e.preventDefault();
            console.log("Iniciando tentativa de login...");
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const submitBtn = document.getElementById('btn-do-login');
            const loginError = document.getElementById('login-error');
            const loginModal = document.getElementById('login-modal');
            const loginForm = document.getElementById('login-form');

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span>Acessando...</span> <i class="fa-solid fa-spinner fa-spin"></i>';
            }

            if (loginError) loginError.classList.add('hidden');

            if (!auth) {
                if (loginError) {
                    loginError.textContent = 'Erro: Firebase Auth não carregou. Recarregue a página.';
                    loginError.classList.remove('hidden');
                }
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<span>Acessar Painel</span> <i class="fa-solid fa-arrow-right"></i>';
                }
                return;
            }

            auth.signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    console.log("Login bem-sucedido:", userCredential.user.email);
                    if (loginModal) loginModal.classList.add('hidden');
                    if (loginForm) loginForm.reset();
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
                        submitBtn.innerHTML = '<span>Acessar Painel</span> <i class="fa-solid fa-arrow-right"></i>';
                    }
                });
    };

    setupLoginEvents();

    // Monitorar estado de autenticação
    if (typeof auth !== 'undefined') {
        auth.onAuthStateChanged((user) => {
            const loginBtn = document.getElementById('login-btn');
            const logoutBtn = document.getElementById('logout-btn');
            const addProcedureLink = document.getElementById('add-procedure-link');
            const isLoginPage = window.location.pathname.includes('admin') || 
                                window.location.pathname.includes('add-procedure.html');

            if (user) {
                if (loginBtn) loginBtn.classList.add('hidden');
                if (logoutBtn) logoutBtn.classList.remove('hidden');
                if (addProcedureLink) {
                    addProcedureLink.classList.remove('hidden');
                    addProcedureLink.innerHTML = '<i class="fa-solid fa-gauge"></i> <span>Painel</span>';
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
    if (!db) {
        console.error('Firestore indisponível — log de atividade não registrado.');
        return Promise.reject(new Error('Firestore indisponível'));
    }
    return db.collection('activity_logs').add({
        action: action,
        title: title,
        category: category,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
};
