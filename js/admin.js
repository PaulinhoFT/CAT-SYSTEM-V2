document.addEventListener('DOMContentLoaded', () => {
    const proceduresAdminBody = document.getElementById('procedures-admin-body');
    const logTableBody = document.getElementById('log-table-body');

    // Carregar Procedimentos
    db.collection('procedures').orderBy('title').onSnapshot(snapshot => {
        proceduresAdminBody.innerHTML = '';
        snapshot.forEach(doc => {
            const p = doc.data();
            const id = doc.id;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${p.title}</td>
                <td>${p.category || 'Sem Categoria'}</td>
                <td class="action-btns">
                    <button class="btn-edit" data-id="${id}">Editar</button>
                    <button class="btn-delete" data-id="${id}">Excluir</button>
                </td>
            `;
            proceduresAdminBody.appendChild(tr);
        });
    });

    // Carregar Logs
    db.collection('activity_logs').orderBy('timestamp', 'desc').limit(20).onSnapshot(snapshot => {
        logTableBody.innerHTML = '';
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

    // Eventos de clique na tabela de procedimentos
    proceduresAdminBody.addEventListener('click', (e) => {
        const target = e.target;
        const id = target.dataset.id;

        if (target.classList.contains('btn-edit')) {
            window.location.href = `add-procedure.html?id=${id}`;
        } else if (target.classList.contains('btn-delete')) {
            if (confirm('Tem certeza que deseja excluir este procedimento?')) {
                db.collection('procedures').doc(id).get().then(doc => {
                    const procedure = doc.data();
                    return db.collection('procedures').doc(id).delete().then(() => {
                        return logActivity('Excluído', procedure.title, procedure.category);
                    });
                }).then(() => {
                    alert('Procedimento excluído com sucesso!');
                }).catch(error => {
                    console.error("Erro ao excluir:", error);
                });
            }
        }
    });
});