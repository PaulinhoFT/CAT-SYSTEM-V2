document.addEventListener('DOMContentLoaded', () => {
    const proceduresList = document.getElementById('procedures-list');
    const procedureContent = document.getElementById('procedure-content');
    const searchInput = document.getElementById('search-input');

    let allProcedures = []; // Armazena todos os procedimentos

    // Carrega e renderiza os procedimentos
    db.collection('procedures').orderBy('title').onSnapshot(snapshot => {
        allProcedures = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderGroupedProcedures(allProcedures);
    });

    function renderGroupedProcedures(procedures) {
        proceduresList.innerHTML = ''; // Limpa a lista
        const grouped = procedures.reduce((acc, p) => {
            const category = p.category || 'Sem Categoria';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(p);
            return acc;
        }, {});

        for (const category in grouped) {
            const details = document.createElement('details');
            details.className = 'category-group';
            details.open = true; // Mantém as categorias abertas por padrão

            const summary = document.createElement('summary');
            summary.textContent = category;
            details.appendChild(summary);

            const ul = document.createElement('ul');
            grouped[category].forEach(p => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <a href="#" class="procedure-link" data-id="${p.id}">${p.title}</a>
                    <div class="procedure-actions">
                        <button class="edit-btn" data-id="${p.id}">✏️</button>
                        <button class="delete-btn" data-id="${p.id}">❌</button>
                    </div>
                `;
                ul.appendChild(li);
            });
            details.appendChild(ul);
            proceduresList.appendChild(details);
        }
    }

    // Filtra os procedimentos em tempo real
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        document.querySelectorAll('.category-group').forEach(group => {
            let hasVisibleProcedures = false;
            group.querySelectorAll('li').forEach(li => {
                const title = li.querySelector('.procedure-link').textContent.toLowerCase();
                if (title.includes(searchTerm)) {
                    li.style.display = '';
                    hasVisibleProcedures = true;
                } else {
                    li.style.display = 'none';
                }
            });
            // Oculta o título da categoria se não houver procedimentos visíveis
            group.style.display = hasVisibleProcedures ? '' : 'none';
        });
    });

    // Lida com cliques na lista de procedimentos (visualizar, editar, excluir)
    proceduresList.addEventListener('click', (e) => {
        e.preventDefault();
        const target = e.target;

        if (target.classList.contains('procedure-link')) {
            // Exibe o procedimento
            const id = target.dataset.id;
            db.collection('procedures').doc(id).get().then(doc => {
                if (doc.exists) {
                    const procedure = doc.data();
                    procedureContent.innerHTML = `
                        <div class="titulo">
                            <h1>${procedure.title}</h1>
                        </div>
                        <div class="conteudo">
                            ${procedure.content}
                        </div>
                    `;
                }
            });
        } else if (target.classList.contains('edit-btn')) {
            // Redireciona para a página de edição
            const id = target.dataset.id;
            window.location.href = `add-procedure.html?id=${id}`;
        } else if (target.classList.contains('delete-btn')) {
            // Exclui o procedimento
            const id = target.dataset.id;
            const procedureToDelete = allProcedures.find(p => p.id === id);
            if (confirm('Tem certeza que deseja excluir este procedimento?')) {
                logActivity('Excluído', procedureToDelete.title, procedureToDelete.category).then(() => {
                    return db.collection('procedures').doc(id).delete();
                }).then(() => {
                    alert('Procedimento excluído com sucesso!');
                    // O onSnapshot irá atualizar a lista automaticamente
                }).catch(error => {
                    console.error("Erro ao excluir procedimento: ", error);
                });
            }
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

    // Carrega o log de atividades
    const logTableBody = document.getElementById('log-table-body');
    if (logTableBody) {
        db.collection('activity_logs').orderBy('timestamp', 'desc').limit(10).onSnapshot(snapshot => {
            logTableBody.innerHTML = ''; // Limpa a tabela
            snapshot.forEach(doc => {
                const log = doc.data();
                const tr = document.createElement('tr');

                const date = log.timestamp ? log.timestamp.toDate().toLocaleString('pt-BR') : 'N/A';
                const actionClass = log.action.toLowerCase().replace('í', 'i');

                tr.innerHTML = `
                    <td><span class="log-action log-${actionClass}">${log.action}</span></td>
                    <td>${log.title}</td>
                    <td>${log.category || 'N/A'}</td>
                    <td>${date}</td>
                `;
                logTableBody.appendChild(tr);
            });
        });
    }
});