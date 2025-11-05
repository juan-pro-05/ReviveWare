// ========== Utilidades ==========
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

// Estado de sesión (mock con localStorage/sessionStorage)
const SESSION_KEY = "reviveware.session";

// ========== Login / Logout ==========
const btnLoginOpen = $("#btnLoginOpen");
const btnLogout = $("#btnLogout");
const loginModal = $("#loginModal");
const loginForm = $("#loginForm");
const loginClose = $("#loginClose");
const loginCancel = $("#loginCancel");
const loginMsg = $("#loginMsg");
const userStatus = $("#userStatus");

function openLogin(){
  if (typeof loginModal?.showModal === "function") loginModal.showModal();
  else loginModal?.setAttribute("open", "true"); // fallback
  if (loginMsg) loginMsg.textContent = "";
  $("#email")?.focus();
}
function closeLogin(){
  if (typeof loginModal?.close === "function") loginModal.close();
  else loginModal?.removeAttribute("open");
}

btnLoginOpen?.addEventListener("click", openLogin);
loginClose?.addEventListener("click", closeLogin);
loginCancel?.addEventListener("click", closeLogin);

loginForm?.addEventListener("submit", async (e)=>{
  e.preventDefault();
  const email = $("#email")?.value.trim();
  const password = $("#password")?.value;
  const remember = $("#remember")?.checked;

  if (!email || !password){
    if (loginMsg) loginMsg.textContent = "Completa correo y contraseña.";
    return;
  }

  try{
    // Sustituye fakeAuth por tu fetch real a backend
    const auth = await fakeAuth(email, password);
    setSession(auth, remember);
    updateUserUI();
    closeLogin();
  }catch(err){
    if (loginMsg) loginMsg.textContent = err.message || "Credenciales inválidas.";
  }
});

btnLogout?.addEventListener("click", ()=>{
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
  updateUserUI();
});

// Mock de autenticación (reemplaza por fetch/axios a tu API)
async function fakeAuth(email, password){
  await new Promise(r=>setTimeout(r, 450)); // simulación de latencia
  if (password.length >= 4){
    return {
      token: "demo_token_" + Math.random().toString(36).slice(2),
      user: { email, name: email.split("@")[0] }
    };
  }
  throw new Error("Contraseña demasiado corta.");
}

function setSession(auth, remember){
  const payload = JSON.stringify(auth);
  if (remember) localStorage.setItem(SESSION_KEY, payload);
  else sessionStorage.setItem(SESSION_KEY, payload);
}

function getSession(){
  const raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
  try{ return raw ? JSON.parse(raw) : null; }catch{ return null; }
}

function updateUserUI(){
  const ses = getSession();
  if (ses?.user){
    if (userStatus) userStatus.textContent = `Sesión: ${ses.user.name}`;
    if (btnLoginOpen) btnLoginOpen.hidden = true;
    if (btnLogout) btnLogout.hidden = false;
  }else{
    if (userStatus) userStatus.textContent = "No has iniciado sesión.";
    if (btnLoginOpen) btnLoginOpen.hidden = false;
    if (btnLogout) btnLogout.hidden = true;
  }
}
updateUserUI();

// ========== Sugeridor de Sistema Operativo ==========
function sugerirOS(){
  const cpu = parseFloat($("#cpu")?.value);
  const ram = parseInt($("#ram")?.value, 10);
  const hdd = parseInt($("#hdd")?.value, 10);
  const year = parseInt($("#year")?.value || "0", 10);

  const errores = [];
  if (isNaN(cpu) || cpu <= 0) errores.push("CPU inválida.");
  if (isNaN(ram) || ram < 1) errores.push("RAM inválida.");
  if (isNaN(hdd) || hdd < 10) errores.push("Disco inválido.");

  if (errores.length){
    mostrarResultado("Completa correctamente el formulario.", `<ul>${errores.map(e=>`<li>${e}</li>`).join("")}</ul>`, "alerta");
    return;
  }

  let perfil = "";
  let sugerencias = [];
  let notas = [];

  if (ram < 2 || cpu < 1.2){
    perfil = "Muy limitado";
    sugerencias = ["antiX Linux", "Puppy Linux", "Bodhi Linux", "Lubuntu (LTS)"];
    if (hdd < 64) notas.push("Considera ChromeOS Flex si el almacenamiento es pequeño.");
  } else if ((ram >= 2 && ram < 4) || cpu < 1.6){
    perfil = "Limitado";
    sugerencias = ["Lubuntu / Xubuntu (LTS)", "Linux Mint XFCE", "Debian XFCE (estable)"];
    if (hdd < 64) notas.push("Usa instalación mínima o sistema en vivo.");
  } else if (ram >= 4 && ram < 8){
    perfil = "Intermedio";
    sugerencias = ["Linux Mint (XFCE/Cinnamon)", "Ubuntu (GNOME optimizado)", "Windows 10 (si lo necesitas)"];
  } else {
    perfil = "Capaz";
    sugerencias = ["Ubuntu/Fedora", "Linux Mint Cinnamon", "Windows 10 / Windows 11 (si cumple TPM/CPU)"];
  }

  if (year){
    if (year < 2010) notas.push("Equipo muy antiguo: prioriza distros ligeras.");
    else if (year < 2015) notas.push("Windows 10 puede ir, pero Linux ligero rendirá mejor.");
    else if (year >= 2018) notas.push("Podría ser compatible con Windows 11; verifica TPM 2.0 y CPU.");
  }

  if (hdd < 64) notas.push("Almacenamiento reducido: usa instalaciones mínimas o ChromeOS Flex.");
  else if (hdd < 120) notas.push("Instala solo lo esencial para ahorrar espacio.");
  else notas.push("Un SSD mejora el rendimiento de forma notable.");

  const html = `
    <div class="title">Perfil estimado: <span class="badge">${perfil}</span></div>
    <p><strong>Sistemas recomendados:</strong></p>
    <ul>${sugerencias.map(s=>`<li>${s}</li>`).join("")}</ul>
    ${notas.length ? `<p><strong>Notas:</strong></p><ul>${notas.map(n=>`<li>${n}</li>`).join("")}</ul>` : ""}
  `;
  mostrarResultado("Sugerencia generada", html, "ok");
}

function mostrarResultado(titulo, contenidoHTML, tipo="ok"){
  const box = $("#resultado");
  if (!box) return;
  box.innerHTML = `<div class="title">${titulo}</div><div>${contenidoHTML}</div>`;
  box.dataset.type = tipo;
}

// Eventos formulario
$("#btnSugerir")?.addEventListener("click", sugerirOS);
$("#btnLimpiar")?.addEventListener("click", () => {
  const res = $("#resultado");
  if (res){
    res.innerHTML = "";
    res.removeAttribute("data-type");
  }
});
$("#laptopForm")?.addEventListener("keydown", (e) => { if (e.key === "Enter"){ e.preventDefault(); sugerirOS(); } });

// ========== Centros (demo) ==========
const centrosData = [
  { nombre: "Centro de Acopio Universitario", url: "#", ciudad: "CDMX" },
  { nombre: "Punto Verde Delegacional", url: "#", ciudad: "CDMX" },
  { nombre: "Recicladora Electrónica Local", url: "#", ciudad: "Edo. Méx." },
];
function renderCentros(){
  const ul = $("#centros");
  if (!ul) return;
  ul.innerHTML = centrosData.map(c => `
    <li>
      <strong>${c.nombre}</strong> — ${c.ciudad}
      <br><a href="${c.url}" target="_blank" rel="noopener">Ver información</a>
    </li>
  `).join("");
}
renderCentros();

// ========== Chatbot ==========
const chatToggle = $("#chatToggle");
const chat = $("#chatbot");
const chatClose = $("#chatClose");
const chatBody = $("#chatBody");
const chatForm = $("#chatForm");
const chatText = $("#chatText");

function openChat(){
  chat?.classList.add("open");
  chat?.setAttribute("aria-hidden", "false");
  chatToggle?.setAttribute("aria-expanded", "true");
  if (chatBody && !chatBody.dataset.boot){
    pushBot("Hola, soy tu asistente. Puedo orientarte entre Linux, Windows y ChromeOS Flex. Escribe 'requisitos', 'windows', 'linux' o 'chromeos'.");
    chatBody.dataset.boot = "1";
  }
  chatText?.focus();
}
function closeChat(){
  chat?.classList.remove("open");
  chat?.setAttribute("aria-hidden", "true");
  chatToggle?.setAttribute("aria-expanded", "false");
}
chatToggle?.addEventListener("click", () => chat?.classList.contains("open") ? closeChat() : openChat());
chatClose?.addEventListener("click", closeChat);

function pushUser(text){
  if (!chatBody) return;
  const el = document.createElement("div");
  el.className = "msg user";
  el.innerHTML = `${escapeHtml(text)}<small>Tú</small>`;
  chatBody.appendChild(el);
  chatBody.scrollTop = chatBody.scrollHeight;
}
function pushBot(text){
  if (!chatBody) return;
  const el = document.createElement("div");
  el.className = "msg bot";
  el.innerHTML = `${text}<small>Asistente</small>`;
  chatBody.appendChild(el);
  chatBody.scrollTop = chatBody.scrollHeight;
}
function escapeHtml(s){ const d = document.createElement("div"); d.textContent = s; return d.innerHTML; }

chatForm?.addEventListener("submit", (e)=>{
  e.preventDefault();
  const text = chatText?.value.trim();
  if (!text) return;
  pushUser(text);
  if (chatText) chatText.value = "";
  setTimeout(()=> pushBot(responder(text)), 200);
});

function responder(input){
  const q = input.toLowerCase();
  const cpu = parseFloat($("#cpu")?.value);
  const ram = parseInt($("#ram")?.value || "0", 10);
  const hdd = parseInt($("#hdd")?.value || "0", 10);
  const year = parseInt($("#year")?.value || "0", 10);

  if (/hola|buenas|qué tal|que tal|hey/.test(q))
    return "¡Hola! Llena el formulario y pulsa “Sugerir Sistema Operativo”, o pregunta por 'requisitos'.";

  if (/(requisitos|minimos|mínimos)/.test(q)) return `
    <p><strong>Guía aproximada:</strong></p>
    <ul>
      <li><em>Muy ligero</em>: &lt; 2 GB RAM o CPU &lt; 1.2 GHz → antiX, Puppy, Lubuntu.</li>
      <li><em>Ligero</em>: 2–4 GB → Lubuntu/Xubuntu, Mint XFCE.</li>
      <li><em>Intermedio</em>: 4–8 GB → Mint, Ubuntu, Windows 10.</li>
      <li><em>Capaz</em>: ≥ 8 GB → Ubuntu/Fedora/Mint; Windows 11 si cumple TPM/CPU.</li>
    </ul><p>Un SSD acelera cualquier opción.</p>`;

  if (/linux/.test(q)) return `
    <p>Linux rinde mejor en equipos modestos:</p>
    <ul><li>antiX/Lubuntu (muy ligeras)</li><li>Mint XFCE (equilibrio)</li><li>Ubuntu/Fedora (modernas)</li></ul>`;

  if (/windows/.test(q)) return `
    <p>Windows necesita más recursos:</p>
    <ul><li>Windows 10: aceptable desde 4 GB RAM (mejor 8 GB).</li><li>Windows 11: normalmente equipos ≥ 2018 con TPM 2.0.</li></ul>`;

  if (/chrome ?os|flex/.test(q)) return `
    <p><strong>ChromeOS Flex</strong> vuela en hardware modesto y poco disco. Ideal si vives en el navegador.</p>`;

  if (/(suger|recomiend|evalu|qué pongo|que pongo)/.test(q)){
    if (!isNaN(cpu) && !isNaN(ram) && !isNaN(hdd)){
      if (ram < 2 || cpu < 1.2)
        return `Con ${ram} GB RAM y ${cpu} GHz, usa <strong>antiX</strong> o <strong>Lubuntu</strong>. ${year? sugerenciaYear(year):""}`;
      if (ram < 4)
        return `Con ${ram} GB, mira <strong>Lubuntu/Xubuntu</strong> o <strong>Mint XFCE</strong>. ${year? sugerenciaYear(year):""}`;
      if (ram < 8)
        return `Puedes usar <strong>Mint</strong> o <strong>Windows 10</strong> (si lo necesitas). ${year? sugerenciaYear(year):""}`;
      return `Tienes margen para <strong>Ubuntu/Fedora</strong> o <strong>Windows 11</strong> si cumple TPM/CPU. ${year? sugerenciaYear(year):""}`;
    }
    return "Para afinar, completa CPU, RAM y Disco y pulsa el botón del formulario.";
  }

  if (/(ssd|disco|almacenamiento|hdd)/.test(q))
    return "Cambiar a <strong>SSD</strong> es la mejora más notable, incluso con 4 GB de RAM.";

  if (/(tpm|windows 11|win11)/.test(q))
    return "Para Windows 11 se pide TPM 2.0 y CPU soportada (habitual en equipos desde 2018). Si no cumples, Windows 10 o Linux van mejor.";

  return "Puedo ayudarte con Linux, Windows y ChromeOS Flex. Pregunta por 'requisitos' o llena el formulario.";
}

function sugerenciaYear(y){
  if (y < 2010) return "Por el año, evita sistemas pesados; distros muy ligeras son ideales.";
  if (y < 2015) return "Por el año, Windows 10 puede ir, pero Linux ligero rendirá mejor.";
  if (y >= 2018) return "Por el año, podrías cumplir con Windows 11 (verifica TPM 2.0 y CPU).";
  return "";
}
