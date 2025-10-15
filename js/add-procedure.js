document.getElementById('add-procedure-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;

    db.collection('procedures').add({
        title: title,
        content: content,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then((docRef) => {
        console.log("Procedimento salvo com ID: ", docRef.id);
        alert("Procedimento salvo com sucesso!");
        document.getElementById('add-procedure-form').reset();
    })
    .catch((error) => {
        console.error("Erro ao salvar procedimento: ", error);
        alert("Ocorreu um erro ao salvar o procedimento.");
    });
});