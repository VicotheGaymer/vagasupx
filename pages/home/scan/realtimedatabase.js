const link = "https://vagas-fb9c4-default-rtdb.firebaseio.com/";

async function http(method, url, body) 
{
  const r = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) throw new Error("HTTP ${r.status} - ${await r.text()}");
  return r.json();
}

function log(msg)
{ 
    document.getElementById("log").textContent = msg; 
}

async function fazreserva() 
{
  try {
    const urlGet = "${link}vaga/01/reservada/.json";
    const atual = await http("GET", urlGet);
    if (atual === true) {
      log("vaga ja reservada");
      return;
    }
    const urlPatch = "${link}vaga/01/reservada/.json";
    await http("PUT", urlPatch, true);
    log("reserva feita com sucesso");
  } catch (e) {
    log("erro ao fazer reserva: " + e.message);
  }
}

async function ocupavaga() {
  try {
    const url = "${link}vaga/01/ocupacao/.json";
    const atual = await http("GET", url);
    if (atual !== false) {
      await http("PUT", url, false);
    }
    log("poste abaixado");
  } catch (e) {
    log("erro ao ocupar vaga: " + e.message);
  }
}

async function desocupavaga() {
  try {
    const url = "${link}vaga/01/ocupacao/.json";
    const atual = await http("GET", url);
    if (atual !== true) {
      await http("PUT", url, true);
    }
    log("poste levantado");
  } catch (e) {
    log("erro ao desocupar vaga: " + e.message);
  }
}
