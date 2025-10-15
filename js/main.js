document.addEventListener('DOMContentLoaded', () => {
    const proceduresList = document.getElementById('procedures-list');
    const procedureContent = document.getElementById('procedure-content');
    const searchInput = document.getElementById('search-input');

    let allProcedures = []; // Armazena todos os procedimentos

    // Carrega a lista de procedimentos na barra lateral
    db.collection('procedures').orderBy('title').onSnapshot(snapshot => {
        allProcedures = []; // Limpa a lista antes de preencher
        proceduresList.innerHTML = ''; // Limpa a lista antes de adicionar os novos itens
        snapshot.forEach(doc => {
            const procedure = { id: doc.id, ...doc.data() };
            allProcedures.push(procedure);
            renderProcedure(procedure);
        });
    });

    // Função para renderizar um procedimento na lista
    function renderProcedure(procedure) {
        const li = document.createElement('li');
        li.innerHTML = `
            <a href="#" class="procedure-link" data-id="${procedure.id}">${procedure.title}</a>
            <div class="procedure-actions">
                <button class="edit-btn" data-id="${procedure.id}">✏️</button>
                <button class="delete-btn" data-id="${procedure.id}">❌</button>
            </div>
        `;
        proceduresList.appendChild(li);
    }

    // Filtra os procedimentos em tempo real
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        proceduresList.innerHTML = ''; // Limpa a lista
        const filteredProcedures = allProcedures.filter(p => p.title.toLowerCase().includes(searchTerm));
        filteredProcedures.forEach(renderProcedure);
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
});