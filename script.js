// Utilidades
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/* =========================
   Sugeridor de Sistema Operativo
   ========================= */
function sugerirOS(){
  const cpu = parseFloat($("#cpu").value);
  const ram = parseInt($("#ram").value, 10);
  const hdd = parseInt($("#hdd").value, 10);
  const year = parseInt($("#year").value || "0", 10);

  // Validación básica
  const errores = [];
  if (isNaN(cpu) || cpu <= 0) errores.push("CPU inválida.");
  if (isNaN(ram) || ram < 1) errores.push("RAM inválida.");
  if (isNaN(hdd) || hdd < 10) errores.push("Disco inválido.");

  if (errores.length){
    mostrarResultado("Completa correctamente el formulario.", `
      <ul>${errores.map(e => `<li>${e}</li>`).join("")}</ul>
    `, "alerta");
    return;
  }

  // Reglas simples y transparentes
  // Nota: Son guías; el soporte de Windows 11 depende de TPM y CPU específicas.
  let perfil = "";
  let sugerencias = [];
  let notas = [];

  if (ram < 2 || cpu < 1.2){
    perfil = "Muy limitado";
    sugerencias = [
      "antiX Linux (muy ligero)",
      "Puppy Linux (ligero, en vivo)",
      "Bodhi Linux (Moksha)",
      "Lubuntu (LTS, en equipos antiguos)"
    ];
    if (hdd < 64) notas.push("Considera ChromeOS Flex si el almacenamiento es pequeño.");
  } else if ((ram >= 2 && ram < 4) || cpu < 1.6){
    perfil = "Limitado";
    sugerencias = [
      "Lubuntu / Xubuntu (LTS)",
      "Linux Mint XFCE",
      "Debian XFCE (estable)"
    ];
    if (hdd < 64) notas.push("Usa partición mínima o un sistema en vivo.");
  } else if (ram >= 4 && ram < 8){
    perfil = "Intermedio";
    sugerencias = [
      "Linux Mint (XFCE o Cinnamon)",
      "Ubuntu (estándar) con GNOME optimizado",
      "Windows 10 LTSC/Pro (si es necesario y el año ≥ 2012)"
    ];
  } else {
    perfil = "Capaz";
    sugerencias = [
      "Fedora Workstation / Ubuntu reciente",
      "Linux Mint Cinnamon",
      "Windows 10 Pro; Windows 11 (si cumple TPM/CPU, normalmente año ≥ 2018)"
    ];
  }

  // Ajustes por año
  if (year){
    if (year < 2010){
      notas.push("Equipo muy antiguo: prioriza distros ligeras (Lubuntu, antiX).");
    } else if (year >= 2010 && year < 2015){
      notas.push("Windows 10 puede funcionar, pero Linux ligero suele rendir mejor.");
    } else if (year >= 2018){
      notas.push("Podría ser compatible con Windows 11, pero verifica TPM 2.0 y CPU.");
    }
  }

  // Ajustes por almacenamiento
  if (hdd < 64){
    notas.push("Almacenamiento reducido: usa instalaciones mínimas o ChromeOS Flex.");
  } else if (hdd < 120){
    notas.push("Considera instalar solo lo esencial para ahorrar espacio.");
  } else {
    notas.push("Si cambias a SSD, la mejora de rendimiento es notable.");
  }

  // Mensaje final
  const html = `
    <div class="title">Perfil estimado: <span class="badge">${perfil}</span></div>
    <p><strong>Sistemas recomendados:</strong></p>
    <ul>${sugerencias.map(s => `<li>${s}</li>`).join("")}</ul>
    ${notas.length ? `<p><strong>Notas:</strong></p><ul>${notas.map(n => `<li>${n}</li>`).join("")}</ul>` : ""}
  `;

  mostrarResultado("Sugerencia generada", html, "ok");
}

// Helpers UI resultado
function mostrarResultado(titulo, contenidoHTML, tipo="ok"){
  const box = $("#resultado");
  box.innerHTML = `
    <div class="title">${titulo}</div>
    <div>${contenidoHTML}</div>
  `;
  box.dataset.type = tipo;
}

// Eventos botones
$("#btnSugerir").addEventListener("click", sugerirOS);
$("#btnLimpiar").addEventListener("click", () => {
  $("#resultado").innerHTML = "";
  $("#resultado").removeAttribute("data-type");
});

// Enter para sugerir
$("#laptopForm").addEventListener("keydown", (e) => {
  if (e.key === "Enter"){ e.preventDefault(); sugerirOS(); }
});

/* =========================
   Centros de reciclaje (ejemplo)
   ========================= */
const centrosData = [
  { nombre: "Centro de Acopio Universitario", url: "#", ciudad: "CDMX" },
  { nombre: "Punto Verde Delegacional", url: "#", ciudad: "CDMX" },
  { nombre: "Recicladora Electrónica Local", url: "#", ciudad: "Edo. Méx." },
];
function renderCentros(){
  const ul = $("#centros");
  ul.innerHTML = centrosData.map(c => `
    <li>
      <strong>${c.nombre}</strong> — ${c.ciudad}
      <br><a href="${c.url}" target="_blank" rel="noopener">Ver información</a>
    </li>
  `).join("");
}
renderCentros();

/* =========================
   Chatbot sencillo (reglas locales)
   ========================= */
const chatToggle = $("#chatToggle");
const chat = $("#chatbot");
const chatClose = $("#chatClose");
const chatBody = $("#chatBody");
const chatForm = $("#chatForm");
const chatText = $("#chatText");

function openChat(){
  chat.classList.add("open");
  chat.setAttribute("aria-hidden", "false");
  chatToggle.setAttribute("aria-expanded", "true");
  if (!chatBody.dataset.boot){
    pushBot("Hola, soy tu asistente. Puedo orientarte entre Linux, Windows y ChromeOS Flex. Pregunta lo que necesites o escribe 'requisitos', 'windows', 'linux', 'chromeos'.");
    chatBody.dataset.boot = "1";
  }
  chatText.focus();
}
function closeChat(){
  chat.classList.remove("open");
  chat.setAttribute("aria-hidden", "true");
  chatToggle.setAttribute("aria-expanded", "false");
}
chatToggle.addEventListener("click", () => chat.classList.contains("open") ? closeChat() : openChat());
chatClose.addEventListener("click", closeChat);

function pushUser(text){
  const el = document.createElement("div");
  el.className = "msg user";
  el.innerHTML = `${escapeHtml(text)}<small>Tú</small>`;
  chatBody.appendChild(el);
  chatBody.scrollTop = chatBody.scrollHeight;
}
function pushBot(text){
  const el = document.createElement("div");
  el.className = "msg bot";
  el.innerHTML = `${text}<small>Asistente</small>`;
  chatBody.appendChild(el);
  chatBody.scrollTop = chatBody.scrollHeight;
}
function escapeHtml(s){
  const d = document.createElement("div"); d.textContent = s; return d.innerHTML;
}

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = chatText.value.trim();
  if (!text) return;
  pushUser(text);
  chatText.value = "";
  setTimeout(() => {
    const reply = responder(text);
    pushBot(reply);
  }, 200);
});

// Motor de respuestas
function responder(input){
  const q = input.toLowerCase();

  // Si hay datos del formulario, podemos personalizar
  const cpu = parseFloat($("#cpu").value);
  const ram = parseInt($("#ram").value || "0", 10);
  const hdd = parseInt($("#hdd").value || "0", 10);
  const year = parseInt($("#year").value || "0", 10);

  // Intenciones básicas
  if (/hola|buenas|qué tal|hey/.test(q)){
    return "¡Hola! ¿Quieres que evalúe tu equipo? Llena el formulario y pulsa “Sugerir Sistema Operativo”.";
  }

  if (/(requisitos|requerimientos|mínimos|minimos)/.test(q)){
    return `
      <p><strong>Guía aproximada:</strong></p>
      <ul>
        <li><em>Muy ligero</em>: &lt; 2 GB RAM o CPU &lt; 1.2 GHz → antiX, Puppy, Lubuntu.</li>
        <li><em>Ligero</em>: 2–4 GB RAM → Lubuntu/Xubuntu, Mint XFCE.</li>
        <li><em>Intermedio</em>: 4–8 GB → Mint, Ubuntu, Windows 10.</li>
        <li><em>Capaz</em>: ≥ 8 GB → Fedora/Ubuntu/Mint; Windows 11 si cumple TPM/CPU.</li>
      </ul>
      <p>Un SSD acelera cualquier opción.</p>
    `;
  }

  if (/linux/.test(q)){
    return `
      <p>Linux brilla en equipos antiguos o para maximizar rendimiento:</p>
      <ul>
        <li><strong>antiX/Lubuntu</strong>: muy ligeras.</li>
        <li><strong>Mint XFCE</strong>: equilibrio entre ligereza y usabilidad.</li>
        <li><strong>Ubuntu/Fedora</strong>: completos para equipos modernos.</li>
      </ul>
    `;
  }

  if (/windows/.test(q)){
    return `
      <p>Windows requiere más recursos:</p>
      <ul>
        <li><strong>Windows 10</strong>: funciona bien desde 4 GB de RAM (mejor con 8 GB).</li>
        <li><strong>Windows 11</strong>: normalmente año ≥ 2018 y TPM 2.0.</li>
      </ul>
      <p>Si tu equipo es justo, Linux suele ir más fluido.</p>
    `;
  }

  if (/chrome ?os|flex/.test(q)){
    return `
      <p><strong>ChromeOS Flex</strong> es rápido en hardware modesto y con poco disco. Ideal si vives en el navegador. Requiere compatibilidad básica con el instalador.</p>
    `;
  }

  if (/(suger|recomiend|evalu|qué pongo|que pongo)/.test(q)){
    if (!isNaN(cpu) && !isNaN(ram) && !isNaN(hdd)){
      // Damos una mini respuesta dinámica
      if (ram < 2 || cpu < 1.2){
        return `Con ${ram} GB RAM y CPU ${cpu} GHz, opta por <strong>antiX</strong> o <strong>Lubuntu</strong>. Si el disco es ${hdd} GB, instala modo mínimo. ${year ? sugerenciaYear(year) : ""}`;
      } else if (ram < 4){
        return `Con ${ram} GB, mira <strong>Lubuntu/Xubuntu</strong> o <strong>Linux Mint XFCE</strong>. Un SSD marcará la diferencia. ${year ? sugerenciaYear(year) : ""}`;
      } else if (ram < 8){
        return `Ya puedes usar <strong>Linux Mint</strong> o <strong>Windows 10</strong> (si lo necesitas). ${year ? sugerenciaYear(year) : ""}`;
      } else {
        return `Tienes margen para <strong>Ubuntu/Fedora</strong> o <strong>Windows 11</strong> si cumple TPM/CPU. ${year ? sugerenciaYear(year) : ""}`;
      }
    }
    return "Para una sugerencia precisa, completa CPU, RAM y Disco y pulsa el botón del formulario.";
  }

  if (/(ssd|disco|almacenamiento|hdd)/.test(q)){
    return "Actualizar a <strong>SSD</strong> es el mejor “milagro” de rendimiento para equipos viejos. Incluso con 4 GB de RAM notarás gran mejora.";
  }

  if (/(tpm|windows 11|win11)/.test(q)){
    return "Para Windows 11 suele requerirse TPM 2.0 y CPU soportada (generalmente equipos de 2018 en adelante). Si no cumples, Windows 10 o Linux son alternativas sólidas.";
  }

  // Respuesta por defecto
  return "Puedo orientarte entre Linux, Windows y ChromeOS Flex. Pregúntame por “requisitos”, “Linux”, “Windows”, “ChromeOS” o completa el formulario y te doy una recomendación.";
}

function sugerenciaYear(y){
  if (y < 2010) return "Por el año, evita sistemas pesados; busca distros muy ligeras.";
  if (y < 2015) return "Por el año, Windows 10 puede ir, pero Linux ligero rendirá mejor.";
  if (y >= 2018) return "Por el año, podrías cumplir con Windows 11 (verifica TPM 2.0 y CPU).";
  return "";
}
