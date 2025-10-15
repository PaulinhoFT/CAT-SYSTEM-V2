document.addEventListener('DOMContentLoaded', () => {
    // Função para o upload de imagem
    function imageHandler() {
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

                try {
                    const snapshot = await imageRef.put(file);
                    const url = await snapshot.ref.getDownloadURL();

                    // Insere a imagem no editor
                    const range = this.quill.getSelection();
                    this.quill.insertEmbed(range.index, 'image', url);
                } catch (error) {
                    console.error("Erro ao fazer upload da imagem: ", error);
                    alert("Falha no upload da imagem.");
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
            }
        }
    });

    const form = document.getElementById('procedure-form');
    const pageTitle = document.getElementById('page-title');
    const titleInput = document.getElementById('title');

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
            }
        });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = titleInput.value;
        const content = quill.root.innerHTML;

        if (procedureId) {
            // Atualiza o procedimento existente
            db.collection('procedures').doc(procedureId).update({
                title: title,
                content: content,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                alert('Procedimento atualizado com sucesso!');
                window.location.href = 'index.html';
            }).catch(error => {
                console.error("Erro ao atualizar procedimento: ", error);
            });
        } else {
            // Adiciona um novo procedimento
            db.collection('procedures').add({
                title: title,
                content: content,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                alert('Procedimento salvo com sucesso!');
                form.reset();
                quill.root.innerHTML = '';
            }).catch(error => {
                console.error("Erro ao salvar procedimento: ", error);
            });
        }
    });
});