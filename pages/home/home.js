const db = firebase.firestore()

function logout() {
    firebase.auth().signOut().then(() => {
        window.location.href = "../../index.html";
    }).catch(() => {
        alert('Erro ao fazer logout');
    })
}

findTransactions();

function findTransactions() {
    firebase.firestore()
        .collection('liberação')
        .get()
        .then(snapshot => {
            const liberacao = snapshot.docs.map(doc => doc.data());
            addTransactionsToScreen(liberacao);
        })
}