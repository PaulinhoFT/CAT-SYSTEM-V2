document.addEventListener('DOMContentLoaded', () => {
    const proceduresList = document.getElementById('procedures-list');
    const procedureContent = document.getElementById('procedure-content');

    // Carrega a lista de procedimentos na barra lateral
    db.collection('procedures').orderBy('title').onSnapshot(snapshot => {
        proceduresList.innerHTML = ''; // Limpa a lista antes de adicionar os novos itens
        snapshot.forEach(doc => {
            const procedure = doc.data();
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#';
            a.textContent = procedure.title;
            a.dataset.id = doc.id;
            li.appendChild(a);
            proceduresList.appendChild(li);
        });
    });

    // Exibe o procedimento ao clicar em um item da lista
    proceduresList.addEventListener('click', (e) => {
        e.preventDefault();
        if (e.target.tagName === 'A') {
            const id = e.target.dataset.id;
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
                } else {
                    console.log("Nenhum procedimento encontrado!");
                }
            }).catch(error => {
                console.error("Erro ao buscar procedimento: ", error);
            });
        }
    });
});