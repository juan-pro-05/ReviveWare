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
  {
    nombre: "Centro de Acopio HidalgoTec",
    ciudad: "Pachuca, Hidalgo",
    url: "https://www.google.com/maps/search/?api=1&query=Centro+de+Acopio+Electrónico+HidalgoTec+Pachuca"
  },
  {
    nombre: "Recicladora Verde Hidalgo",
    ciudad: "Tulancingo, Hidalgo",
    url: "https://www.google.com/maps/search/?api=1&query=Recicladora+Verde+Hidalgo+Tulancingo"
  },
  {
    nombre: "EcoCentro Universitario Hidalgo",
    ciudad: "Tizayuca, Hidalgo",
    url: "https://www.google.com/maps/search/?api=1&query=EcoCentro+Universitario+Hidalgo+Tizayuca"
  },
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
/* =========================
   Motor de respuestas mejorado (FAQ + coincidencias)
   Reemplaza la función responder existente por esta versión.
   ========================= */

// Lista de preguntas frecuentes (puedes ampliarla)
const FAQS = [
  {
    keys: ["requisitos", "mínimos", "minimos", "requerimientos"],
    answer: `
      <p><strong>Guía de requisitos (orientativa):</strong></p>
      <ul>
        <li><strong>Muy ligero:</strong> &lt; 2 GB RAM o CPU &lt; 1.2 GHz → antiX, Puppy, Lubuntu.</li>
        <li><strong>Ligero:</strong> 2–4 GB RAM → Lubuntu/Xubuntu, Linux Mint XFCE.</li>
        <li><strong>Intermedio:</strong> 4–8 GB RAM → Linux Mint (Cinnamon/XFCE), Ubuntu optimizado, Windows 10.</li>
        <li><strong>Capaz:</strong> ≥ 8 GB RAM → Ubuntu/Fedora/Mint; Windows 11 si cumple TPM/CPU.</li>
      </ul>
      <p><em>Consejo:</em> cambiar a <strong>SSD</strong> y aumentar RAM suele dar la mejora más notable.</p>
    `
  },
  {
    keys: ["ssd", "disco", "hdd", "almacenamiento"],
    answer: `
      <p><strong>Actualizar a SSD:</strong></p>
      <ol>
        <li>Un SSD reduce tiempos de arranque y carga de aplicaciones dramáticamente.</li>
        <li>Con 4 GB de RAM + SSD suele ser suficiente para Windows 10 o una distribución Linux completa.</li>
        <li>Si tu disco es &lt; 64 GB, considera <em>ChromeOS Flex</em> o una instalación Linux mínima.</li>
      </ol>
      <p>Si quieres, te doy pasos para clonar tu HDD a SSD según tu sistema operativo (Windows/Linux).</p>
    `
  },
  {
    keys: ["windows 11", "win11", "tpm", "tpms"],
    answer: `
      <p><strong>Compatibilidad Windows 11:</strong></p>
      <ul>
        <li>Windows 11 normalmente requiere <strong>TPM 2.0</strong> y CPUs soportadas (la mayoría desde 2018).</li>
        <li>Si tu equipo no cumple, <strong>Windows 10</strong> o una distribución Linux son opciones sólidas.</li>
      </ul>
      <p>Puedo verificar requisitos aproximados si me das el año y CPU de tu equipo (rellena el formulario).</p>
    `
  },
  {
    keys: ["linux", "distro", "distros", "mint", "ubuntu", "lubuntu"],
    answer: `
      <p><strong>¿Qué distro elegir?</strong></p>
      <ul>
        <li><strong>antiX / Puppy:</strong> para hardware extremadamente limitado.</li>
        <li><strong>Lubuntu / Xubuntu:</strong> ligeras y accesibles.</li>
        <li><strong>Linux Mint (XFCE/Cinnamon):</strong> equilibrio sencillez/rendimiento.</li>
        <li><strong>Ubuntu / Fedora:</strong> para equipos modernos y usuarios que quieren software actualizado.</li>
      </ul>
      <p>Si quieres, te doy un enlace a una ISO o una guía de instalación paso a paso.</p>
    `
  },
  {
    keys: ["chromeos", "chrome os", "flex"],
    answer: `
      <p><strong>ChromeOS Flex</strong></p>
      <ul>
        <li>Ideal si tu uso es sólo navegador y quieres un sistema muy ligero.</li>
        <li>Funciona bien en hardware modesto y con poco espacio en disco.</li>
        <li>Requiere comprobar compatibilidad con el instalador oficial.</li>
      </ul>
    `
  },
  {
    keys: ["guardar", "reciclaje", "guardar reciclaje", "guardar datos"],
    answer: `
      <p><strong>Cómo guardar un reciclaje en la plataforma:</strong></p>
      <ol>
        <li>Inicia sesión (botón <em>Iniciar sesión</em> en la cabecera).</li>
        <li>Rellena el formulario de características o el formulario específico de reciclaje (tipo, cantidad).</li>
        <li>Pulsa el botón para 'Guardar' o 'Sugerir' (si está integrado al flujo).</li>
      </ol>
      <p>Si usas Supabase o nuestra API, los reciclajes se guardan automáticamente con tu usuario autenticado.</p>
    `
  },
  {
    keys: ["centro", "centros", "mapa", "maps", "hidalgo", "pachuca", "tulancingo"],
    answer: `
      <p><strong>Centros en Hidalgo</strong></p>
      <p>He listado algunos centros en Hidalgo en la sección derecha. Haz clic en <em>Ver en Google Maps</em> para abrir la ruta en Maps.</p>
      <p>Si me das tu ciudad exacta, puedo sugerir el centro más cercano.</p>
    `
  },
  {
    keys: ["privacidad", "datos", "seguridad", "protección", "gdpr", "lfpdppp"],
    answer: `
      <p><strong>Privacidad y seguridad de datos</strong></p>
      <ul>
        <li>Las contraseñas se deben guardar <strong>hashed</strong> (bcrypt) en el servidor.</li>
        <li>Usamos HTTPS para transmitir datos y JWT para autenticación.</li>
        <li>Los reportes públicos se sirven en formato <em>agregado y anónimo</em>.</li>
      </ul>
      <p>Si quieres, te doy el esqueleto de la política de privacidad que puedes usar en tu proyecto.</p>
    `
  },
  {
    keys: ["recompensa", "recompensas", "puntos", "canje"],
    answer: `
      <p><strong>Cómo funcionan las recompensas</strong></p>
      <ol>
        <li>Cada reciclaje registrado suma puntos según tipo y cantidad.</li>
        <li>Los puntos se acumulan en tu cuenta y puedes canjearlos por descuentos o beneficios en aliados.</li>
        <li>El cálculo de puntos y catálogo de canjes se configura desde el panel administrativo.</li>
      </ol>
      <p>¿Quieres una tabla de ejemplo de conversión Kg → Puntos?</p>
    `
  },
  {
    keys: ["soporte", "contacto", "ayuda", "manual"],
    answer: `
      <p><strong>Soporte y documentación</strong></p>
      <ul>
        <li>Manual de usuario: disponible en la sección de Documentación (puedo generar uno básico para tu proyecto).</li>
        <li>Soporte técnico: ofrece email y horarios de atención — te ayudo a crear un texto estándar.</li>
      </ul>
    `
  },
  {
    keys: ["legal", "normativas", "cumplimiento", "regulaciones"],
    answer: `
      <p><strong>Cumplimiento y normativas</strong></p>
      <p>Para reportes oficiales y trazabilidad te recomendamos:</p>
      <ul>
        <li>Registrar: fecha, tipo de residuo, cantidad, centro receptor y empresa recicladora.</li>
        <li>Generar reportes agregados mensuales para autoridades.</li>
        <li>Guardar evidencias y bitácoras de recolección durante el periodo exigido por la normativa local.</li>
      </ul>
    `
  }
];

// función de búsqueda simple: devuelve la primera FAQ cuya key coincida
function findFAQAnswer(q) {
  const text = q.toLowerCase();
  // coincidencia por keywords
  for (const faq of FAQS) {
    for (const k of faq.keys) {
      if (text.includes(k)) return faq.answer;
    }
  }
  return null;
}

// función que intenta aproximar respuestas más ricas
function responder(input){
  const q = (input || "").trim();
  if (!q) return "Dime qué necesitas: usa palabras como 'requisitos', 'SSD', 'Linux', 'Windows', 'reciclaje' o 'centros'.";

  // saludos rápidos
  if (/\b(hola|buenas|hey|saludos)\b/i.test(q)) {
    return "¡Hola! Soy tu asistente. Puedes pedirme: 'requisitos', 'sugerencia', 'SSD', 'Windows 11', 'Linux', 'centros', 'guardar reciclaje', o 'privacidad'.";
  }

  // Intención de ayuda específica: si menciona 'suger' o 'evalu' o 'recom', hacemos énfasis en datos del formulario
  if (/\b(suger|recomend|evalu|qué pongo|que pongo|recomendación)\b/i.test(q)) {
    // si tenemos datos del formulario, damos respuesta personalizada
    const cpu = parseFloat($("#cpu")?.value);
    const ram = parseInt($("#ram")?.value || "0", 10);
    const hdd = parseInt($("#hdd")?.value || "0", 10);
    const year = parseInt($("#year")?.value || "0", 10);

    if (!isNaN(cpu) && !isNaN(ram) && !isNaN(hdd) && cpu > 0 && ram > 0 && hdd > 0) {
      // delegar al sugeridor principal (la función que ya tienes)
      // retornamos texto HTML con la sugerencia inmediata
      // reutilizamos la función sugerirOS para consistencia: la llamamos pero no queremos que modifique el DOM aquí.
      // En su lugar, replicamos la lógica mínima:
      let perfil = "", sugerencias = [], notas = [];
      if (ram < 2 || cpu < 1.2) {
        perfil = "Muy limitado";
        sugerencias = ["antiX Linux", "Puppy Linux", "Lubuntu"];
      } else if ((ram >=2 && ram <4) || cpu < 1.6) {
        perfil = "Limitado";
        sugerencias = ["Lubuntu / Xubuntu", "Linux Mint XFCE"];
      } else if (ram >=4 && ram <8) {
        perfil = "Intermedio";
        sugerencias = ["Linux Mint (XFCE/Cinnamon)", "Ubuntu optimizado", "Windows 10"];
      } else {
        perfil = "Capaz";
        sugerencias = ["Ubuntu / Fedora", "Linux Mint Cinnamon", "Windows 11 (si cumple TPM)"];
      }
      if (year) {
        if (year < 2010) notas.push("Equipo muy antiguo: prioriza distros ligeras.");
        else if (year < 2015) notas.push("Windows 10 puede funcionar; Linux ligero rinde mejor.");
        else if (year >= 2018) notas.push("Podrías ser compatible con Windows 11; verifica TPM 2.0.");
      }
      if (hdd < 64) notas.push("Almacenamiento reducido: considera ChromeOS Flex o instalaciones mínimas.");
      else if (hdd < 120) notas.push("Instala solo lo esencial para ahorrar espacio.");
      else notas.push("Si instalas un SSD, el rendimiento mejorará notablemente.");

      return `
        <p><strong>Perfil estimado:</strong> ${perfil}</p>
        <p><strong>Sugerencias:</strong></p>
        <ul>${sugerencias.map(s => `<li>${s}</li>`).join("")}</ul>
        ${notas.length ? `<p><strong>Notas:</strong></p><ul>${notas.map(n => `<li>${n}</li>`).join("")}</ul>` : ""}
      `;
    } else {
      return "Para darte una recomendación precisa, completa <strong>CPU, RAM y Disco</strong> en el formulario y pulsa 'Sugerir Sistema Operativo'.";
    }
  }

  // busca en FAQS
  const faqAnswer = findFAQAnswer(q);
  if (faqAnswer) return faqAnswer;

  // preguntas relacionadas con autenticación / guardar en BD / api
  if (/\b(login|registrar|registro|registro cuenta|iniciar sesión|crear cuenta)\b/i.test(q)) {
    return `
      <p><strong>Registro e inicio de sesión:</strong></p>
      <ol>
        <li>Haz clic en <em>Iniciar sesión</em> (arriba) y selecciona registrar o usa la opción de signup.</li>
        <li>Si tu proyecto usa Supabase/Firebase o la API, el frontend enviará correo/contraseña al backend y recibirás un token.</li>
        <li>Guarda sesión con <code>localStorage</code> o <code>sessionStorage</code> según prefieras 'recordarme'.</li>
      </ol>
      <p>Puedo mostrarte el código exacto para Supabase/Firebase o para una API en Node.js.</p>
    `;
  }

  if (/\b(api|supabase|firebase|backend|servidor)\b/i.test(q)) {
    return `
      <p><strong>Integración rápida con base de datos:</strong></p>
      <ul>
        <li><strong>Supabase:</strong> Postgres + Auth listo; ideal para mantener SQL y reglas RLS.</li>
        <li><strong>Firebase/Firestore:</strong> NoSQL, muy simple para prototipos.</li>
        <li>Puedo proporcionarte el snippet para conectar y guardar 'reciclajes' desde tu frontend ahora mismo.</li>
      </ul>
    `;
  }

  if (/\b(contacto|soporte|ayuda)\b/i.test(q)) {
    return `
      <p>Si necesitas soporte real:</p>
      <ul>
        <li>Especifica: <em>email</em> o <em>horario</em> para que te prepare el texto de contacto y la plantilla de respuesta automática.</li>
      </ul>
    `;
  }

  // fallback avanzado: ofrecer acciones concretas
  return `
    <p>No estoy seguro exactamente, pero puedo ayudar. Prueba alguna de estas acciones:</p>
    <ol>
      <li>Escribe <strong>"requisitos"</strong> para ver qué sistema elegir.</li>
      <li>Completa el formulario y escribe <strong>"sugerir"</strong> o pulsa el botón <em>Sugerir Sistema Operativo</em>.</li>
      <li>Pregunta <strong>"¿cómo guardo un reciclaje?"</strong> para ver cómo integrarlo con una base de datos.</li>
    </ol>
    <p>Si quieres, copia tu pregunta exacta y te doy una respuesta paso a paso.</p>
  `;
}
