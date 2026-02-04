document.addEventListener('DOMContentLoaded', () => {
    // Registra o módulo de redimensionamento de imagem
    if (window.ImageResize) {
        Quill.register('modules/imageResize', window.ImageResize.default);
    }

    // Função para o upload de imagem
    function imageHandler() {
        const quillInstance = this.quill; // Armazena a instância do Quill

        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            if (file) {
                const storageRef = storage.ref();
                const imageName = `${Date.now()}-${file.name}`;
                const imageRef = storageRef.child(`images/${imageName}`);

                const range = quillInstance.getSelection(true);
                try {
                    // Mostra um feedback de carregamento
                    quillInstance.insertText(range.index, ' [Uploading image...] ', 'user');

                    const snapshot = await imageRef.put(file);
                    const url = await snapshot.ref.getDownloadURL();

                    // Remove o texto de carregamento e insere a imagem
                    quillInstance.deleteText(range.index, ' [Uploading image...] '.length);
                    quillInstance.insertEmbed(range.index, 'image', url);
                    quillInstance.setSelection(range.index + 1, Quill.sources.SILENT);

                } catch (error) {
                    console.error("Erro ao fazer upload da imagem: ", error);
                    alert("Falha no upload da imagem. Verifique o console para mais detalhes (F12).");
                    quillInstance.deleteText(range.index, ' [Uploading image...] '.length);
                }
            }
        };
    }

    // Inicializa o editor Quill
    const quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: {
                container: [
                    [{ 'header': [1, 2, false] }],
                    ['bold', 'italic', 'underline'],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['link', 'image']
                ],
                handlers: {
                    'image': imageHandler
                }
            },
            imageResize: {
                parchment: Quill.import('parchment'),
                modules: ['Resize', 'DisplaySize', 'Toolbar']
            }
        }
    });

    const form = document.getElementById('procedure-form');
    const pageTitle = document.getElementById('page-title');
    const titleInput = document.getElementById('title');
    const categoryInput = document.getElementById('category');

    // Verifica se estamos em modo de edição
    const urlParams = new URLSearchParams(window.location.search);
    const procedureId = urlParams.get('id');

    if (procedureId) {
        // Modo de edição
        pageTitle.textContent = 'Editar Procedimento';
        db.collection('procedures').doc(procedureId).get().then(doc => {
            if (doc.exists) {
                const procedure = doc.data();
                titleInput.value = procedure.title;
                quill.root.innerHTML = procedure.content;
                if (procedure.category) {
                    categoryInput.value = procedure.category;
                }
            }
        });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = titleInput.value;
        const content = quill.root.innerHTML;
        const category = categoryInput.value;
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Salvando...';

        if (procedureId) {
            // Atualiza o procedimento existente
            db.collection('procedures').doc(procedureId).update({
                title: title,
                content: content,
                category: category,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                return logActivity('Editado', title, category);
            }).then(() => {
                alert('Procedimento atualizado com sucesso!');
                window.location.href = 'admin-procedures.html';
            }).catch(error => {
                console.error("Erro ao atualizar procedimento: ", error);
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            });
        } else {
            // Adiciona um novo procedimento
            db.collection('procedures').add({
                title: title,
                content: content,
                category: category,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                return logActivity('Novo', title, category);
            }).then(() => {
                alert('Procedimento salvo com sucesso!');
                window.location.href = 'admin-procedures.html';
            }).catch(error => {
                console.error("Erro ao salvar procedimento: ", error);
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            });
        }
    });
});