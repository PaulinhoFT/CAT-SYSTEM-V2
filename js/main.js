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
        const filteredProcedures = allProcedures.filter(p => p.title.toLowerCase().includes(searchTerm));
        renderGroupedProcedures(filteredProcedures);
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
            if (confirm('Tem certeza que deseja excluir este procedimento?')) {
                db.collection('procedures').doc(id).delete().then(() => {
                    alert('Procedimento excluído com sucesso!');
                    // O onSnapshot irá atualizar a lista automaticamente
                }).catch(error => {
                    console.error("Erro ao excluir procedimento: ", error);
                });
            }
        }
    });

    // Lógica para o modo claro/escuro
    const themeToggle = document.getElementById('theme-toggle');
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
});