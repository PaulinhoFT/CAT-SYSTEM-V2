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
        const target = e.target;

        // Verifica se clicou no resumo da categoria (summary) para animação de slide suave
        const summaryTarget = target.closest('summary');
        if (summaryTarget) {
            e.preventDefault();
            const details = summaryTarget.parentElement;
            toggleDetailsSmoothly(details);
            return;
        }

        if (target.classList.contains('procedure-link')) {
            e.preventDefault();
            // Exibe o procedimento
            const id = target.dataset.id;
            
            // Efeito de fade out
            procedureContent.style.opacity = '0';
            procedureContent.style.transform = 'translateY(10px)';

            db.collection('procedures').doc(id).get().then(doc => {
                if (doc.exists) {
                    const procedure = doc.data();
                    setTimeout(() => {
                        procedureContent.innerHTML = `
                            <div class="titulo">
                                <h1>${procedure.title}</h1>
                            </div>
                            <div class="conteudo">
                                ${cleanDarkInlineColors(procedure.content)}
                            </div>
                        `;
                        // Efeito de fade in
                        procedureContent.style.opacity = '1';
                        procedureContent.style.transform = 'translateY(0)';
                        
                        // Scroll suave para o topo do conteúdo em mobile
                        if (window.innerWidth <= 768) {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                            document.getElementById('menu-toggle').checked = false; // Fecha a sidebar
                        }
                    }, 200);
                }
            });
        } else if (target.classList.contains('edit-btn')) {
            e.preventDefault();
            // Redireciona para a página de edição
            const id = target.dataset.id;
            window.location.href = `add-procedure.html?id=${id}`;
        } else if (target.classList.contains('delete-btn')) {
            e.preventDefault();
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

    // Limpa cores escuras inline (como preto, cinza escuro, rgb(0,0,0)) para que herdem a cor do tema dinamicamente
    function cleanDarkInlineColors(htmlContent) {
        if (!htmlContent) return '';
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;

        const elementsWithStyle = tempDiv.querySelectorAll('[style]');
        elementsWithStyle.forEach(el => {
            const color = el.style.color;
            if (color) {
                const standardColor = color.trim().toLowerCase();
                if (
                    standardColor === 'black' || 
                    standardColor === 'darkgray' || 
                    standardColor === 'darkgrey' || 
                    standardColor === '#000' || 
                    standardColor === '#000000' || 
                    standardColor === '#333' || 
                    standardColor === '#333333' ||
                    standardColor === '#1e293b' ||
                    standardColor === '#0f172a'
                ) {
                    el.style.color = '';
                } else if (standardColor.startsWith('rgb')) {
                    const matches = standardColor.match(/\d+/g);
                    if (matches && matches.length >= 3) {
                        const r = parseInt(matches[0]);
                        const g = parseInt(matches[1]);
                        const b = parseInt(matches[2]);
                        // Se for uma cor muito escura (R, G, B abaixo de 110)
                        if (r < 110 && g < 110 && b < 110) {
                            el.style.color = '';
                        }
                    }
                }
            }
        });
        return tempDiv.innerHTML;
    }

    // Realiza uma transição de slide suave (Slide Toggle Accordion) nos elementos <details> da barra lateral
    function toggleDetailsSmoothly(details) {
        const content = details.querySelector('ul'); // Elemento interno da lista que desliza
        if (!content) return;

        // Evita chamadas concorrentes durante a transição
        if (details.dataset.animating === 'true') return;
        details.dataset.animating = 'true';

        content.style.overflow = 'hidden';

        if (details.open) {
            // Fechando: Define a transição de fechamento mais lenta e elegante (0.55 segundos com ease-in-out)
            content.style.transition = 'height 0.55s cubic-bezier(0.4, 0, 0.2, 1)';
            
            // Define a altura atual medida e transiciona para 0
            const startHeight = content.offsetHeight;
            content.style.height = `${startHeight}px`;
            
            // Força reflow para aplicar o estilo antes de iniciar a transição
            content.offsetHeight;
            
            content.style.height = '0px';

            const onTransitionEnd = (e) => {
                if (e.propertyName === 'height') {
                    content.removeEventListener('transitionend', onTransitionEnd);
                    details.open = false;
                    content.style.height = '';
                    content.style.overflow = '';
                    content.style.transition = '';
                    delete details.dataset.animating;
                }
            };
            content.addEventListener('transitionend', onTransitionEnd);
        } else {
            // Abrindo: Abre o elemento detalhes, zera a altura e transiciona para a altura completa medida
            details.open = true;
            const targetHeight = content.offsetHeight;
            
            // Define a transição de abertura suave e responsiva (0.4 segundos com ease-in-out)
            content.style.transition = 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            content.style.height = '0px';
            content.offsetHeight; // Força reflow
            
            content.style.height = `${targetHeight}px`;

            const onTransitionEnd = (e) => {
                if (e.propertyName === 'height') {
                    content.removeEventListener('transitionend', onTransitionEnd);
                    content.style.height = '';
                    content.style.overflow = '';
                    content.style.transition = '';
                    delete details.dataset.animating;
                }
            };
            content.addEventListener('transitionend', onTransitionEnd);
        }
    }
});