document.addEventListener('DOMContentLoaded', () => {
    const proceduresList = document.getElementById('procedures-list');
    const procedureContent = document.getElementById('procedure-content');

    // Carrega a lista de procedimentos na barra lateral
    db.collection('procedures').orderBy('title').onSnapshot(snapshot => {
        proceduresList.innerHTML = ''; // Limpa a lista antes de adicionar os novos itens
        snapshot.forEach(doc => {
            const procedure = doc.data();
            const li = document.createElement('li');
            li.innerHTML = `
                <a href="#" class="procedure-link" data-id="${doc.id}">${procedure.title}</a>
                <div class="procedure-actions">
                    <button class="edit-btn" data-id="${doc.id}">✏️</button>
                    <button class="delete-btn" data-id="${doc.id}">❌</button>
                </div>
            `;
            proceduresList.appendChild(li);
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