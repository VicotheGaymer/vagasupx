const dono = sessionStorage.getItem("emaillogado");
//----------------------------------------------------------------------------------

function teste(){console.log(dono)}

const link = "https://vagas-fb9c4-default-rtdb.firebaseio.com/";

async function http(method, url, body) {
    const r = await fetch(url, {
        method,
        headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!r.ok) throw new Error(`HTTP ${r.status} - ${await r.text()}`);
    return r.json();
}

function log(msg)
{ 
    document.getElementById("log").textContent = msg; 
}

async function funcaoexecutar(id) {
    try {
        const urlGet = link + 'vaga/0' + id + '/reservada.json';
        const urlDono = link + 'vaga/0' + id + '/dono.json';
        const atual = await http("GET", urlGet);
        if (atual === true) {
            console.log("vaga ja reservada");
            return;
        }
        const urlPatch = link + 'vaga/0' + id + '/reservada.json';
        await http("PUT", urlPatch, true);
        await http("PUT", urlDono, dono);
        console.log("reserva feita com sucesso");
    } catch (e) {
        console.log("erro ao fazer reserva: " + e.message);
    }      
}

async function funcaoliberar(id) {
    // Sua função personalizada ao LIBERAR uma vaga
    try {
        const url = link + 'vaga/0' + id + '/ocupacao.json';
        const atual = await http("GET", url);
        if (atual !== false) {
        await http("PUT", url, false);
        }
        console.log("poste abaixado");
    } catch (e) {
        console.log("erro ao abaixar: " + e.message);
    }
}

async function funcaofechar(id) {
    const spot = spots.find(s => s.id === id);
    try {
        const urlGet = link + 'vaga/0' + id + '/reservada.json';
        const url = link + 'vaga/0' + id + '/ocupacao.json';
        const atual = await http("GET", url);
        if (atual !== true) {
            await http("PUT", url, true);
            await http("PUT", urlGet, false);
        }
        console.log("poste levantado");
    } catch (e) {
        console.log("erro ao desocupar vaga: " + e.message);
    }
}

// ==========================================
async function getstatus(tipo, id) {
    if(tipo == 0)
    {
        const urlGet = link + 'vaga/0' + id + '/reservada.json';
        const atual = await http("GET", urlGet);

        if(atual === true)
        {
            return 'reservada';
        }
        else{
            return 'disponivel';
        }
    }
    if(tipo == 1)
    {
        const urlGet2 = link + 'vaga/0' + id + '/ocupacao.json';
        const atual2 = await http("GET", urlGet2);
        return atual2;
    }
}

// Estado das vagas
const spots = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    status: 'disponivel', 
    liberado: false // controla se já foi clicado em liberar
}));

// Ícone do carro SVG
const carIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
        <circle cx="7" cy="17" r="2"/>
        <path d="M9 17h6"/>
        <circle cx="17" cy="17" r="2"/>
    </svg>
`;

function updateStats() {
    const counts = {
        disponivel: spots.filter(s => s.status === 'disponivel').length,
        reservada: spots.filter(s => s.status === 'reservada').length,
        ocupada: spots.filter(s => s.status === 'ocupada').length
    };

    document.getElementById('count-disponivel').textContent = counts.disponivel;
    document.getElementById('count-reservada').textContent = counts.reservada;
    document.getElementById('count-ocupada').textContent = counts.ocupada;
}

async function handleReservar(id) {
    const urlreserva = link + 'vaga/0' + id + '/reservada.json';
    const atual = await http("GET", urlreserva);
    const spot = spots.find(s => s.id === id);
    if (spot && spot.status === 'disponivel' && atual !== true) {
        spot.status = 'reservada';
        spot.liberado = false;
        renderSpots();
        updateStats();

        funcaoexecutar(id);
    }else if(atual === true) {
        console.log('vagaocupada nada aconetece');
    }
}

function handleLiberar(id) {
    const spot = spots.find(s => s.id === id);
    
    if (spot) {
        if (spot.status === 'reservada' && !spot.liberado) {
            // Primeiro clique em Liberar: continua reservada mas marca como liberado
            spot.liberado = true;
            renderSpots();
            updateStats();
            
            // Executa função customizada de liberar
            funcaoliberar(id);
        } else if (spot.status === 'reservada' && spot.liberado) {
            // Segundo clique (Fechar): volta para disponível
            spot.status = 'disponivel';
            spot.liberado = false;
            renderSpots();
            updateStats();
            
            // Executa função customizada de fechar
            funcaofechar(id);
        } else if (spot.status === 'ocupada') {
            spot.status = 'disponivel';
            spot.liberado = false;
            renderSpots();
            updateStats();
        }
    }
}

function getButtonText(status, liberado) {
    if (status === 'reservada' && liberado) {
        return 'Fechar';
    } else if (status === 'reservada' && !liberado) {
        return 'Liberar';
    }
    return 'Fechar';
}

function renderSpots() {
    const grid = document.getElementById('parking-grid');
    grid.innerHTML = spots.map(spot => `
        <div class="parking-spot ${spot.status}">
            <div class="spot-header">
                ${carIcon}
                <span class="spot-number">Vaga ${spot.id}</span>
            </div>
            <div class="spot-buttons">
                <button 
                    class="btn-reservar" 
                    onclick="handleReservar(${spot.id})"
                    ${spot.status !== 'disponivel' ? 'disabled' : ''}
                >
                    Reservar
                </button>
                <button 
                    class="btn-liberar" 
                    onclick="handleLiberar(${spot.id})"
                    ${spot.status === 'disponivel' ? 'disabled' : ''}
                >
                    ${getButtonText(spot.status, spot.liberado)}
                </button>
            </div>
        </div>
    `).join('');
}

// Renderização inicial
renderSpots();

updateStats();






