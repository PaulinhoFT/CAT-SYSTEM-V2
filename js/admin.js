document.addEventListener('DOMContentLoaded', () => {
    const proceduresAdminBody = document.getElementById('procedures-admin-body');
    const activityLogList = document.getElementById('activity-log-list');
    
    // Metrics Elements
    const metricTotalProcedures = document.getElementById('metric-total-procedures');
    const metricTotalCategories = document.getElementById('metric-total-categories');
    const metricLogsToday = document.getElementById('metric-logs-today');
    const searchInput = document.getElementById('admin-search-input');

    if (typeof db === 'undefined') {
        console.error('Firebase DB not initialized');
        return;
    }

    // Carregar Procedimentos
    db.collection('procedures').orderBy('title').onSnapshot(snapshot => {
        if (proceduresAdminBody) {
            proceduresAdminBody.innerHTML = '';
            let categories = new Set();
            
            snapshot.forEach(doc => {
                const p = doc.data();
                const id = doc.id;
                if (p.category) categories.add(p.category);
                
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${p.title}</td>
                    <td><span class="yellow" style="font-size: 0.7rem;">${p.category || 'Sem Categoria'}</span></td>
                    <td>
                        <button class="btn-action-sm btn-edit-sm" data-id="${id}" title="Editar">
                            <i class="fa fa-edit" data-id="${id}"></i>
                        </button>
                        <button class="btn-action-sm btn-delete-sm" data-id="${id}" title="Excluir">
                            <i class="fa fa-trash" data-id="${id}"></i>
                        </button>
                    </td>
                `;
                proceduresAdminBody.appendChild(tr);
            });

            // Update Metrics
            if (metricTotalProcedures) metricTotalProcedures.textContent = snapshot.size;
            if (metricTotalCategories) metricTotalCategories.textContent = categories.size;
        }
    }, error => {
        console.error("Erro ao carregar procedimentos:", error);
    });

    // Carregar Logs de Atividade
    db.collection('activity_logs').orderBy('timestamp', 'desc').limit(10).onSnapshot(snapshot => {
        if (activityLogList) {
            activityLogList.innerHTML = '';
            
            let todayCount = 0;
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            snapshot.forEach(doc => {
                const log = doc.data();
                const timestamp = log.timestamp ? log.timestamp.toDate() : null;
                
                if (timestamp && timestamp >= today) {
                    todayCount++;
                }

                const li = document.createElement('li');
                li.className = 'activity-item';
                
                let iconClass = 'fa-plus-circle';
                let iconColor = '#1ABB9C';
                
                const action = log.action ? log.action.toLowerCase() : '';
                if (action.includes('edit')) {
                    iconClass = 'fa-edit';
                    iconColor = '#f59e0b';
                } else if (action.includes('exclu')) {
                    iconClass = 'fa-trash';
                    iconColor = '#E74C3C';
                }

                const timeStr = timestamp ? timestamp.toLocaleString('pt-BR') : 'Agora mesmo';

                li.innerHTML = `
                    <div class="activity-icon" style="color: ${iconColor}">
                        <i class="fa ${iconClass}"></i>
                    </div>
                    <div class="activity-content">
                        <h4>${log.action}: ${log.title}</h4>
                        <p>Categoria: ${log.category || 'N/A'}</p>
                        <span class="activity-time">${timeStr}</span>
                    </div>
                `;
                activityLogList.appendChild(li);
            });

            if (metricLogsToday) metricLogsToday.textContent = todayCount;
        }
    }, error => {
        console.error("Erro ao carregar logs:", error);
    });

    // Filtro de Pesquisa na Tabela
    if (searchInput && proceduresAdminBody) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const rows = proceduresAdminBody.querySelectorAll('tr');
            
            rows.forEach(row => {
                const title = row.querySelector('td:first-child').textContent.toLowerCase();
                const category = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
                
                if (title.includes(searchTerm) || category.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }

    // Eventos de clique na tabela de procedimentos
    if (proceduresAdminBody) {
        proceduresAdminBody.addEventListener('click', (e) => {
            const target = e.target;
            const id = target.dataset.id;
            
            if (!id) return;

            if (target.classList.contains('btn-edit-sm') || target.parentElement.classList.contains('btn-edit-sm')) {
                window.location.href = `add-procedure.html?id=${id}`;
            } else if (target.classList.contains('btn-delete-sm') || target.parentElement.classList.contains('btn-delete-sm')) {
                if (confirm('Tem certeza que deseja excluir este procedimento?')) {
                    db.collection('procedures').doc(id).get().then(doc => {
                        if (doc.exists) {
                            const procedure = doc.data();
                            return db.collection('procedures').doc(id).delete().then(() => {
                                return logActivity('Excluído', procedure.title, procedure.category);
                            });
                        }
                    }).then(() => {
                        // O onSnapshot cuidará da atualização da UI
                    }).catch(error => {
                        console.error("Erro ao excluir:", error);
                        alert("Erro ao excluir procedimento.");
                    });
                }
            }
        });
    }

    // Auth State Check to update profile info
    if (typeof auth !== 'undefined') {
        auth.onAuthStateChanged(user => {
            if (user) {
                const userNameElems = [document.getElementById('sidebar-user-name'), document.getElementById('nav-user-name')];
                const nameToShow = user.displayName || user.email.split('@')[0];
                userNameElems.forEach(el => {
                    if (el) el.textContent = nameToShow;
                });
            }
        });
    }

    // Card Toggle Logic (Minimizar/Maximizar)
    document.querySelectorAll('.card-tools .fa-chevron-up').forEach(icon => {
        icon.addEventListener('click', function() {
            const card = this.closest('.dashboard-card');
            const cardBody = card.querySelector('.card-body');
            if (cardBody.style.display === 'none') {
                cardBody.style.display = 'block';
                this.style.transform = 'rotate(0deg)';
            } else {
                cardBody.style.display = 'none';
                this.style.transform = 'rotate(180deg)';
            }
        });
    });

    // --- Configurações da Conta ---

    // Atualizar Perfil (Nome)
    const updateProfileForm = document.getElementById('update-profile-form');
    if (updateProfileForm) {
        updateProfileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newName = document.getElementById('new-display-name').value;
            if (!newName) return;

            const user = firebase.auth().currentUser;
            user.updateProfile({
                displayName: newName
            }).then(() => {
                alert('Nome atualizado com sucesso!');
                const sidebarName = document.getElementById('sidebar-user-name');
                if (sidebarName) sidebarName.textContent = newName;
                updateProfileForm.reset();
            }).catch(error => {
                console.error("Erro ao atualizar nome:", error);
                alert("Erro: " + error.message);
            });
        });
    }

    // Alterar Senha
    const changePasswordForm = document.getElementById('change-password-form');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newPassword = document.getElementById('new-password').value;
            if (!newPassword) return;

            const user = firebase.auth().currentUser;
            user.updatePassword(newPassword).then(() => {
                alert('Senha atualizada com sucesso!');
                changePasswordForm.reset();
            }).catch(error => {
                console.error("Erro ao atualizar senha:", error);
                alert("Erro: " + error.message + "\n(Pode ser necessário sair e entrar novamente para realizar esta ação por segurança)");
            });
        });
    }

    // Criar Novo Administrador
    const createUserForm = document.getElementById('create-user-form');
    if (createUserForm) {
        createUserForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('new-user-email').value;
            const password = document.getElementById('new-user-password').value;

            if (!email || !password) {
                alert("Por favor, preencha e-mail e senha.");
                return;
            }

            if (password.length < 6) {
                alert("A senha deve ter pelo menos 6 caracteres.");
                return;
            }

            // Para criar usuário sem deslogar o atual, usamos uma instância secundária
            const secondaryApp = firebase.initializeApp(firebaseConfig, "SecondaryInstance_" + Date.now());
            secondaryApp.auth().createUserWithEmailAndPassword(email, password)
                .then(() => {
                    alert('Novo administrador criado com sucesso!');
                    createUserForm.reset();
                    return secondaryApp.delete();
                })
                .catch(error => {
                    console.error("Erro ao criar usuário:", error);
                    alert("Erro: " + error.message);
                    secondaryApp.delete();
                });
        });
    }
});
