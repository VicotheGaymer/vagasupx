const db = firebase.firestore();

function logout() 
{
    firebase.auth().signOut().then(() => {
        window.location.href = "../../index.html";
    }).catch(() => {
        alert('Erro ao fazer logout');
    })
}

function findTransactions() 
{
    firebase.firestore().collection('liberação').get().then(snapshot => {
        const liberacao = snapshot.docs.map(doc => doc.data());
        addTransactionsToScreen(liberacao);
    })
}

findTransactions();

async function confirmaLixoReciclavel() {
    try {
        const document = await db.collection('confirmaLixo').doc('Uy8wHLrXmi3i7vyV828s').get();
        
        if (!document.exists) {
            console.log("Documento não encontrado");
            return;
        }

        const lidoReciclavel = document.data().lidoReciclavel;
        const confirmaReciclavel = document.data().confirmaReciclavel;

        if (lidoReciclavel == true) 
        {
            if(confirmaReciclavel == true)
            {
                alert('Quantide de pontos aumentou');
            }
            else
            {
                alert('Quantide de pontos não aumentou');
            }
        } 
        else 
        {
        
        }

        console.log('Documento Atualizado');
    } catch (e) {
        console.log('Erro ao tentar atualizar o documento', e);
    }
}

async function confirmaLixoOrganico() {
    try {
        const document = await db.collection('confirmaLixo').doc('Uy8wHLrXmi3i7vyV828s').get();
        
        if (!document.exists) 
        {
            console.log("Documento não encontrado");
            return;
        }

        const lidoOrganico = document.data().lidoOrganico;
        const confirmaOrganico = document.data().confirmaOrganico;

        if (lidoOrganico == true) 
        {
            if(confirmaOrganico == true)
            {
                alert('Quantide de pontos aumentou');
            }
            else
            {
                alert('Quantide de pontos não aumentou');
            }
        } 
        else 
        {
        
        }

        console.log('Documento Atualizado');
    } catch (e) {
        console.log('Erro ao tentar atualizar o documento', e);
    }
}


function openRecicle()
{
    db.collection('liberação').doc('c5ocuuBspLfKGuaDP7a2')
    .update({reciclavel : true })
    .then(() => {
        console.log('Documento Atualizado');
    }).catch(e => {
        console.log('Documento Não Atualizado', e);
    })
}

function openOrganic()
{
    db.collection('liberação').doc('c5ocuuBspLfKGuaDP7a2')
    .update({organic : true })
    .then(() => {
        console.log('Documento Atualizado');
    }).catch(e => {
        console.log('Documento Não Atualizado', e);
    })
}