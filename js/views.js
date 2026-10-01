/* Vitalia — vistas. Cada función recibe el contexto del router y devuelve
   { titulo, html, montar(raiz) } o { redirigir, mensaje }. */

/* ---------- Utilidades ---------- */

function esc(texto) {
  return String(texto ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function quetzales(n) {
  return "Q" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function iniciales(nombre) {
  const partes = String(nombre || "").replace(/^(Dra?|Licda?)\.\s*/i, "").trim().split(/\s+/);
  if (!partes[0]) return "?";
  const ultima = partes.length > 1 ? partes[partes.length - 1] : "";
  return (partes[0][0] + (ultima[0] || "")).toUpperCase();
}

function primerNombre(nombre) {
  return String(nombre || "").trim().split(/\s+/)[0] || "";
}

function nombreCorto(nombre) {
  const p = String(nombre || "").trim().split(/\s+/);
  return p.length > 1 ? `${p[0]} ${p[p.length - 1][0]}.` : p[0];
}

function cap(t) { return t ? t[0].toUpperCase() + t.slice(1) : t; }

function hashTexto(texto) {
  let h = 7;
  for (const c of String(texto)) h = (h * 31 + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

function iso(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function desdeIso(s) {
  const [a, m, d] = s.split("-").map(Number);
  return new Date(a, m - 1, d);
}

function proximosDias(n) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return Array.from({ length: n }, (_, i) => { const d = new Date(hoy); d.setDate(hoy.getDate() + i); return d; });
}

function fechaLarga(s) {
  return cap(desdeIso(s).toLocaleDateString("es-GT", { weekday: "long", day: "numeric", month: "long" }));
}

function fechaCorta(s) {
  return desdeIso(s).toLocaleDateString("es-GT", { day: "numeric", month: "short", year: "numeric" }).replace(".", "");
}

function esHoy(s) { return s === iso(new Date()); }

function ultimosMeses(n) {
  const hoy = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - (n - 1 - i), 1);
    return cap(d.toLocaleDateString("es-GT", { month: "short" }).replace(".", ""));
  });
}

function buscarMedico(id) { return DATA.medicos.find((m) => m.id === id); }

function articulo(m) { return /^(Dra|Licda)\./.test(m.nombre) ? "La" : "El"; }

function nombrePaciente() {
  const { usuario } = State.get();
  return (usuario && usuario.nombre) || DATA.paciente.nombreDemo;
}

// Cita actual o, si no hay, una cita de demostración para que ninguna pantalla quede vacía
function citaOEjemplo() {
  const s = State.get();
  if (s.citaActual && buscarMedico(s.citaActual.medicoId)) {
    return { cita: s.citaActual, medico: buscarMedico(s.citaActual.medicoId), ejemplo: false };
  }
  return {
    cita: { medicoId: "m01", fecha: iso(new Date()), hora: "11:00", motivo: "Dolor de garganta" },
    medico: buscarMedico("m01"),
    ejemplo: true
  };
}

function toast(mensaje) {
  const t = document.getElementById("toast");
  t.textContent = mensaje;
  t.classList.add("visible");
  clearTimeout(toast._id);
  toast._id = setTimeout(() => t.classList.remove("visible"), 3800);
}

/* ---------- Cámara y micrófono ---------- */

const Media = {
  stream: null,
  async pedir() {
    if (this.stream) return this.stream;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error("sin-soporte");
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch (e) {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
    }
    return this.stream;
  },
  detener() {
    if (this.stream) this.stream.getTracks().forEach((t) => t.stop());
    this.stream = null;
  },
  pistas(tipo) {
    return this.stream ? (tipo === "audio" ? this.stream.getAudioTracks() : this.stream.getVideoTracks()) : [];
  }
};

/* ---------- Íconos SVG inline ---------- */

const ICONOS = {
  check: "M20 6 9 17l-5-5",
  verificado: "M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6l8-3zM9 12l2 2 4-4",
  estrella: "M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3l-5.5 2.9 1-6.2L3 9.6l6.2-.9L12 3z",
  video: "M3 7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM15 10l6-3v10l-6-3",
  videoOff: "M3 7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM15 10l6-3v10l-6-3M2 2l20 20",
  calendario: "M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM4 10h16M8 2v4M16 2v4",
  tarjeta: "M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 10h18M7 15h4",
  pastilla: "M10.5 3.5a5 5 0 0 1 7 7l-7 7a5 5 0 0 1-7-7zM7 7l7 7",
  archivo: "M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8zM14 3v5h5M9 13h6M9 17h4",
  mic: "M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zM5 11a7 7 0 0 0 14 0M12 18v3",
  micOff: "M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zM5 11a7 7 0 0 0 14 0M12 18v3M3 3l18 18",
  colgar: "M3 14.5c5-4.6 13-4.6 18 0l-2.4 2.6-3.3-1.6.1-2.6c-2.2-.7-4.6-.7-6.8 0l.1 2.6-3.3 1.6z",
  senal: "M4 20v-3M9 20v-7M14 20V9M19 20V4",
  menu: "M4 6h16M4 12h16M4 18h16",
  cerrar: "M6 6l12 12M18 6 6 18",
  usuario: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 4-6 8-6s8 2 8 6",
  usuarios: "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21c0-4 3-6 7-6s7 2 7 6M16 3.5a4 4 0 0 1 0 7.5M22 21c0-3-1.7-5-4.5-5.7",
  escudo: "M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6l8-3z",
  candado: "M6 11h12v10H6zM8 11V7a4 4 0 0 1 8 0v4",
  chat: "M21 12a8 8 0 0 1-11.6 7.1L4 20l1.1-4.6A8 8 0 1 1 21 12z",
  reloj: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2",
  ubicacion: "M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12zM12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  idioma: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18",
  corazon: "M12 20s-7-4.4-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.6-9 9-9 9z",
  pulso: "M12 20s-7-4.4-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.6-9 9-9 9zM6 12h3l1.5-3 3 6 1.5-3h3",
  flecha: "M5 12h14M13 6l6 6-6 6",
  descargar: "M12 4v11M7 10l5 5 5-5M5 20h14",
  edificio: "M4 21V5l8-2v18M12 8h8v13M8 8v.01M8 12v.01M8 16v.01M16 12v.01M16 16v.01M2 21h20",
  grafica: "M4 20V10M10 20V4M16 20v-7M2 20h20",
  estetoscopio: "M6 3v6a4 4 0 0 0 8 0V3M10 13v2a5 5 0 0 0 10 0v-1M18 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0",
  bebe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM9 14c1.5 1.5 4.5 1.5 6 0M9 10h.01M15 10h.01",
  flor: "M12 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM12 13v8M9 18h6",
  piel: "M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z",
  conversacion: "M21 12a8 8 0 0 1-11.6 7.1L4 20l1.1-4.6A8 8 0 1 1 21 12zM9 12h.01M13 12h.01M17 12h.01",
  cerebro: "M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z",
  organos: "M9 3h6v3H9zM7 4.5H5V21h14V4.5h-2M9 11h6M9 15h6M9 19h3",
  info: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 11v5M12 8h.01",
  audio: "M4 10v4M8 7v10M12 4v16M16 7v10M20 10v4",
  campana: "M6 16v-5a6 6 0 0 1 12 0v5l2 2H4zM10 21h4",
  farmacia: "M9 3h6v6h6v6h-6v6H9v-6H3V9h6z",
  agencia: "M3 9l2-5h14l2 5M4 9v11h16V9M3 9h18M9 20v-6h6v6",
  enviar: "M21 3 10 14M21 3l-7 18-4-7-7-4z",
  filtro: "M3 5h18l-7 8v6l-4 2v-8z",
  wifi: "M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01",
  billete: "M3 6h18v12H3zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM6 9v.01M18 15v.01",
  reiniciar: "M4 4v6h6M20 20v-6h-6M5.5 15a7.5 7.5 0 0 0 13 2.5M18.5 9A7.5 7.5 0 0 0 5.5 6.5",
  casa: "M3 11l9-8 9 8M5 9.5V21h14V9.5M10 21v-6h4v6"
};

function Icon(nombre, clase = "") {
  return `<svg class="icono ${clase}" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${ICONOS[nombre] || ICONOS.info}"/></svg>`;
}

function estrellas(valor) {
  const llenas = Math.round(valor);
  return `<span class="estrellas" aria-label="${valor} de 5 estrellas">${[1, 2, 3, 4, 5]
    .map((i) => Icon("estrella", i <= llenas ? "relleno" : "vacia")).join("")}</span>`;
}

function avatar(nombre, tam = "") {
  return `<span class="avatar ${tam}" aria-hidden="true">${esc(iniciales(nombre))}</span>`;
}

function badgeVerificado(m) {
  return m.colegiadoVerificado
    ? `<span class="badge badge-verificado">${Icon("verificado")}Colegiado verificado · No. ${esc(m.colegiado)}</span>`
    : "";
}

function badgeHoy(m) {
  return m.disponibleHoy ? `<span class="badge badge-hoy">Disponible hoy</span>` : "";
}

function encabezadoPagina(titulo, subtitulo, extra = "") {
  return `<section class="encabezado-pagina"><div class="contenedor">
    <h1>${titulo}</h1>${subtitulo ? `<p class="subtitulo">${subtitulo}</p>` : ""}${extra}
  </div></section>`;
}

function resumenCitaHtml(cita, medico) {
  return `<dl class="resumen-lista">
    <div><dt>Médico</dt><dd>${esc(medico.nombre)}<small>${esc(medico.especialidad)}</small></dd></div>
    <div><dt>Fecha</dt><dd>${esc(fechaLarga(cita.fecha))}</dd></div>
    <div><dt>Hora</dt><dd>${esc(cita.hora)} (hora de Guatemala)</dd></div>
    <div><dt>Motivo</dt><dd>${esc(cita.motivo || "Sin especificar")}</dd></div>
  </dl>`;
}

function planesHtml() {
  return `<div class="planes">${DATA.planes.map((p) => `
    <article class="plan ${p.destacado ? "plan-destacado" : ""}">
      ${p.destacado ? `<span class="badge badge-hoy plan-insignia">Más elegido por familias</span>` : ""}
      <h3>${esc(p.nombre)}</h3>
      <p class="plan-precio"><strong>${quetzales(p.precio).replace(".00", "")}</strong> <span>${esc(p.periodo)}</span></p>
      <ul class="lista-check">${p.incluye.map((i) => `<li>${Icon("check")}${esc(i)}</li>`).join("")}</ul>
      <a class="btn ${p.destacado ? "" : "btn-sec"} btn-bloque" href="${p.ruta}">${esc(p.accion)}</a>
    </article>`).join("")}
  </div>
  <p class="nota">Precios de ejemplo en quetzales, IVA incluido.</p>`;
}

const Views = {};

/* ---------- 6.1 Inicio ---------- */

Views.inicio = () => {
  const m = buscarMedico("m01");
  return {
    titulo: "",
    html: `
    <section class="hero"><div class="contenedor hero-grid">
      <div class="hero-texto">
        <p class="eyebrow">${Icon("verificado")}Telemedicina hecha en Guatemala</p>
        <h1>Tu médico, desde donde estés.</h1>
        <p class="hero-sub">Videoconsultas con médicos colegiados en Guatemala, con receta electrónica y expediente en un solo lugar.</p>
        <div class="acciones">
          <a class="btn btn-grande" href="#/medicos">Buscar médico ${Icon("flecha")}</a>
          <a class="btn btn-sec btn-grande" href="#/planes">Ver planes</a>
        </div>
        <ul class="hero-datos">
          <li><strong>46</strong> médicos colegiados</li>
          <li><strong>11 min</strong> en promedio para iniciar</li>
          <li><strong>22</strong> departamentos</li>
        </ul>
      </div>
      <div class="vista-previa-wrap" aria-hidden="true">
        <div class="vista-previa">
          <div class="vp-barra"><span class="vp-punto"></span>Consulta en curso · 04:12<span class="vp-senal">${Icon("senal")}</span></div>
          <div class="vp-escenario">
            ${avatar(m.nombre, "avatar-xl")}
            <p class="vp-nombre">${esc(m.nombre)}<small>${esc(m.especialidad)} · Colegiado ${esc(m.colegiado)}</small></p>
            <div class="vp-pip">${avatar("Carlos Méndez")}<small>Tú</small></div>
          </div>
          <div class="vp-controles">
            <span>${Icon("mic")}</span><span>${Icon("video")}</span><span class="vp-colgar">${Icon("colgar")}</span>
          </div>
        </div>
        <div class="vp-receta">${Icon("pastilla")}<div><strong>Receta electrónica enviada</strong><small>VT-2026-004812</small></div></div>
      </div>
    </div></section>

    <section class="seccion"><div class="contenedor">
      <h2>Cómo funciona</h2>
      <ol class="pasos">
        <li><span class="paso-num">1</span><h3>Elige a tu médico</h3><p>Filtra por especialidad, departamento o idioma. Todos tienen colegiado verificado.</p></li>
        <li><span class="paso-num">2</span><h3>Agenda y paga</h3><p>Escoge fecha y hora. Paga con tarjeta, Recurrente o en una agencia.</p></li>
        <li><span class="paso-num">3</span><h3>Conéctate por video</h3><p>Desde tu celular o computadora. Si la señal es débil, usa solo audio.</p></li>
        <li><span class="paso-num">4</span><h3>Recibe tu receta</h3><p>Receta electrónica con código de verificación y descuento en farmacias aliadas.</p></li>
      </ol>
    </div></section>

    <section class="seccion seccion-suave"><div class="contenedor">
      <h2>Especialidades</h2>
      <p class="subtitulo">Elige una para ver los médicos disponibles.</p>
      <div class="especialidades">
        ${DATA.especialidades.map((e) => `
          <a class="especialidad" href="#/medicos?esp=${encodeURIComponent(e.nombre)}">
            <span class="especialidad-icono">${Icon(e.icono)}</span>
            <span><strong>${esc(e.nombre)}</strong><small>${esc(e.texto)}</small></span>
          </a>`).join("")}
      </div>
    </div></section>

    <section class="seccion"><div class="contenedor dos-columnas">
      <div>
        <h2>Pensado para todo el país</h2>
        <p>En muchos municipios no hay un especialista cerca. Viajar a la cabecera o a la capital cuesta un día de trabajo y el pasaje. Vitalia lleva la consulta hasta donde estés.</p>
        <p class="cifra-destacada"><strong>38 %</strong> de nuestros usuarios viven en áreas rurales.</p>
      </div>
      <ul class="caracteristicas">
        <li>${Icon("audio")}<div><h3>Modo de baja conexión</h3><p>Si la señal es débil, la consulta sigue solo con audio y consume mucho menos datos.</p></div></li>
        <li>${Icon("idioma")}<div><h3>Médicos que hablan tu idioma</h3><p>Atención en español, k'iche', q'eqchi' y kaqchikel.</p></div></li>
        <li>${Icon("agencia")}<div><h3>Pago sin tarjeta</h3><p>Paga en una agencia bancaria o con Recurrente y recibe tu confirmación por WhatsApp.</p></div></li>
      </ul>
    </div></section>

    <section class="seccion seccion-suave" id="planes"><div class="contenedor">
      <h2>Planes</h2>
      <p class="subtitulo">Paga por consulta o protege a toda tu familia.</p>
      ${planesHtml()}
    </div></section>

    <section class="seccion"><div class="contenedor">
      <div class="cta-medico">
        <div>
          <h2>¿Eres médico?</h2>
          <p>Atiende desde tu clínica o tu casa con horario flexible. Verificamos tu colegiado activo para que tus pacientes confíen desde la primera consulta.</p>
        </div>
        <a class="btn btn-maiz btn-grande" href="#/panel-medico">Unirme como médico</a>
      </div>
    </div></section>`
  };
};

/* ---------- Planes (enlace del encabezado) ---------- */

Views.planes = () => ({
  titulo: "Planes",
  html: encabezadoPagina("Planes", "Paga por consulta o protege a toda tu familia con una cuota mensual.") + `
    <section class="seccion"><div class="contenedor">
      ${planesHtml()}
      <div class="tarjeta tarjeta-info">
        ${Icon("corazon")}
        <div><h3>Consultas subsidiadas</h3>
        <p>Una parte de cada plan financia consultas gratuitas para familias de escasos recursos en áreas rurales, en alianza con municipalidades y ONG.</p></div>
      </div>
    </div></section>`
});

/* ---------- 6.2 Entrar / registrarse ---------- */

Views.entrar = () => {
  const { usuario } = State.get();
  const u = usuario || {};
  return {
    titulo: "Entrar",
    html: `
    <section class="seccion"><div class="contenedor contenedor-angosto">
      <div class="tarjeta">
        <h1 class="titulo-tarjeta">Crea tu cuenta</h1>
        <p class="subtitulo">Te toma menos de un minuto. Solo pedimos lo necesario para atenderte.</p>
        <form id="form-entrar" novalidate>
          <div class="campo">
            <label for="f-nombre">Nombre completo</label>
            <input id="f-nombre" name="nombre" autocomplete="name" value="${esc(u.nombre)}" required>
            <p class="error" data-error="nombre"></p>
          </div>
          <div class="campo">
            <label for="f-tel">Teléfono (WhatsApp)</label>
            <div class="input-prefijo"><span>+502</span><input id="f-tel" name="telefono" type="tel" inputmode="numeric" placeholder="5555 0123" value="${esc(u.telefono)}" required></div>
            <p class="error" data-error="telefono"></p>
          </div>
          <div class="campo">
            <label for="f-correo">Correo electrónico <span class="opcional">(opcional)</span></label>
            <input id="f-correo" name="correo" type="email" autocomplete="email" value="${esc(u.correo)}">
          </div>
          <div class="campo">
            <label for="f-depto">Departamento</label>
            <select id="f-depto" name="departamento">
              ${DATA.departamentos.map((d) => `<option ${d === (u.departamento || "Guatemala") ? "selected" : ""}>${esc(d)}</option>`).join("")}
            </select>
          </div>
          <label class="casilla">
            <input type="checkbox" name="privacidad" id="f-priv">
            <span>Acepto el <button type="button" class="enlace" data-abrir-privacidad-local>aviso de privacidad</button></span>
          </label>
          <p class="error" data-error="privacidad"></p>
          <button class="btn btn-bloque btn-grande" type="submit">Crear cuenta</button>
        </form>
        <p class="texto-centro"><button type="button" class="enlace" id="btn-demo">Ya tengo cuenta</button></p>
      </div>
    </div></section>`,
    montar(raiz) {
      const form = raiz.querySelector("#form-entrar");
      raiz.querySelector("[data-abrir-privacidad-local]").addEventListener("click", () => document.getElementById("dlg-privacidad").showModal());
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const datos = Object.fromEntries(new FormData(form));
        const errores = {
          nombre: datos.nombre.trim().length < 3 ? "Escribe tu nombre completo." : "",
          telefono: datos.telefono.replace(/\D/g, "").length !== 8 ? "El teléfono debe tener 8 dígitos." : "",
          privacidad: !form.privacidad.checked ? "Para continuar, acepta el aviso de privacidad." : ""
        };
        Object.entries(errores).forEach(([k, v]) => { form.querySelector(`[data-error="${k}"]`).textContent = v; });
        const primero = Object.keys(errores).find((k) => errores[k]);
        if (primero) { (form.elements[primero] || form.querySelector("#f-priv")).focus(); return; }
        State.set({ usuario: { nombre: datos.nombre.trim(), telefono: datos.telefono.trim(), correo: datos.correo.trim(), departamento: datos.departamento } });
        toast(`Bienvenido a Vitalia, ${primerNombre(datos.nombre)}.`);
        Router.ir("/medicos");
      });
      raiz.querySelector("#btn-demo").addEventListener("click", () => {
        State.set({ usuario: { nombre: DATA.paciente.nombreDemo, telefono: "5555 0123", correo: "carlos.mendez@ejemplo.com", departamento: DATA.paciente.departamento } });
        toast("Entraste como Carlos Méndez (usuario de demostración).");
        Router.ir("/medicos");
      });
    }
  };
};

/* ---------- 6.3 Buscar médico ---------- */

const FILTROS_INICIALES = { esp: "", depto: "", hoy: false, idioma: "" };
let filtros = { ...FILTROS_INICIALES };
Views.reiniciarFiltros = () => { filtros = { ...FILTROS_INICIALES }; };

function filaMedico(m) {
  return `<article class="medico-fila">
    ${avatar(m.nombre, "avatar-g")}
    <div class="medico-info">
      <div class="medico-titulo"><h3>${esc(m.nombre)}</h3>${badgeHoy(m)}</div>
      <p class="medico-esp">${esc(m.especialidad)}</p>
      ${badgeVerificado(m)}
      <ul class="medico-datos">
        <li>${Icon("ubicacion")}${esc(m.departamento)}</li>
        <li>${Icon("idioma")}${esc(m.idiomas.join(", "))}</li>
        <li>${Icon("estrella", "relleno icono-maiz")}<strong>${m.calificacion.toFixed(1)}</strong>&nbsp;(${m.consultas} consultas)</li>
      </ul>
    </div>
    <div class="medico-accion">
      <p class="precio">${quetzales(m.precio)}<span>por consulta</span></p>
      <a class="btn" href="#/medico/${m.id}">Ver horarios</a>
    </div>
  </article>`;
}

Views.medicos = (ctx) => {
  const esp = ctx.query.get("esp");
  if (esp !== null) {
    filtros = { ...FILTROS_INICIALES, esp: DATA.especialidades.some((e) => e.nombre === esp) ? esp : "" };
    history.replaceState(null, "", "#/medicos");
  }
  const opciones = (lista, valor, todos) =>
    `<option value="">${todos}</option>` + lista.map((x) => `<option ${x === valor ? "selected" : ""}>${esc(x)}</option>`).join("");

  return {
    titulo: "Buscar médico",
    html: encabezadoPagina("Buscar médico", "Todos los médicos tienen su número de colegiado verificado ante el Colegio de Médicos y Cirujanos.") + `
    <section class="seccion seccion-compacta"><div class="contenedor busqueda">
      <aside class="filtros" aria-label="Filtros">
        <button class="btn btn-sec btn-bloque filtros-toggle" type="button" aria-expanded="false" aria-controls="filtros-panel">${Icon("filtro")}Filtros <span id="filtros-cuenta"></span></button>
        <div class="filtros-panel" id="filtros-panel">
          <div class="campo">
            <label for="fl-esp">Especialidad</label>
            <select id="fl-esp" data-filtro="esp">${opciones(DATA.especialidades.map((e) => e.nombre), filtros.esp, "Todas las especialidades")}</select>
          </div>
          <div class="campo">
            <label for="fl-depto">Departamento</label>
            <select id="fl-depto" data-filtro="depto">${opciones(DATA.departamentos, filtros.depto, "Todo el país")}</select>
          </div>
          <div class="campo">
            <label for="fl-idioma">Idioma</label>
            <select id="fl-idioma" data-filtro="idioma">${opciones(DATA.idiomas, filtros.idioma, "Cualquier idioma")}</select>
          </div>
          <label class="interruptor">
            <input type="checkbox" role="switch" data-filtro="hoy" ${filtros.hoy ? "checked" : ""}>
            <span class="interruptor-pista" aria-hidden="true"></span>
            <span>Disponible hoy</span>
          </label>
          <button class="enlace" type="button" data-quitar-filtros>Quitar filtros</button>
        </div>
      </aside>
      <div>
        <p class="conteo" id="conteo" aria-live="polite"></p>
        <div id="resultados" class="resultados"></div>
      </div>
    </div></section>`,
    montar(raiz) {
      const resultados = raiz.querySelector("#resultados");
      const conteo = raiz.querySelector("#conteo");
      const cuenta = raiz.querySelector("#filtros-cuenta");

      function pintar() {
        const lista = DATA.medicos.filter((m) =>
          (!filtros.esp || m.especialidad === filtros.esp) &&
          (!filtros.depto || m.departamento === filtros.depto) &&
          (!filtros.hoy || m.disponibleHoy) &&
          (!filtros.idioma || m.idiomas.includes(filtros.idioma)));
        const activos = ["esp", "depto", "idioma", "hoy"].filter((k) => filtros[k]).length;
        cuenta.textContent = activos ? `(${activos})` : "";
        conteo.textContent = lista.length === 1 ? "1 médico disponible" : `${lista.length} médicos disponibles`;
        resultados.innerHTML = lista.length
          ? lista.map(filaMedico).join("")
          : `<div class="vacio">
              ${Icon("ubicacion")}
              <p>Ningún médico coincide con esos filtros. Quita el filtro de departamento para ver médicos de todo el país.</p>
              <button class="btn" type="button" data-quitar-filtros>Quitar filtros</button>
            </div>`;
      }

      raiz.querySelectorAll("[data-filtro]").forEach((el) => el.addEventListener("change", () => {
        const k = el.dataset.filtro;
        filtros[k] = el.type === "checkbox" ? el.checked : el.value;
        pintar();
      }));

      raiz.addEventListener("click", (e) => {
        if (e.target.closest("[data-quitar-filtros]")) {
          filtros = { ...FILTROS_INICIALES };
          raiz.querySelectorAll("select[data-filtro]").forEach((s) => (s.value = ""));
          raiz.querySelector('[data-filtro="hoy"]').checked = false;
          pintar();
        }
      });

      const toggle = raiz.querySelector(".filtros-toggle");
      toggle.addEventListener("click", () => {
        const abierto = raiz.querySelector(".filtros").classList.toggle("abierto");
        toggle.setAttribute("aria-expanded", String(abierto));
      });

      pintar();
    }
  };
};

/* ---------- 6.4 Perfil del médico y agenda ---------- */

Views.perfil = (ctx) => {
  const m = buscarMedico(ctx.params[0]);
  if (!m) return Views.noEncontrada();
  const dias = proximosDias(7);
  const previa = State.get().citaActual;
  let fechaSel = previa && previa.medicoId === m.id ? previa.fecha : null;
  let horaSel = previa && previa.medicoId === m.id ? previa.hora : null;

  const ocupado = (fecha, hora) => hashTexto(m.id + fecha + hora) % 4 === 0;
  const diaDisponible = (fecha) => !(esHoy(fecha) && !m.disponibleHoy);

  return {
    titulo: m.nombre,
    html: `
    <section class="seccion seccion-compacta"><div class="contenedor">
      <a class="volver" href="#/medicos">← Volver a la búsqueda</a>
      <div class="perfil">
        <div class="perfil-principal">
          <div class="tarjeta perfil-cabecera">
            ${avatar(m.nombre, "avatar-xl")}
            <div>
              <div class="medico-titulo"><h1 class="titulo-tarjeta">${esc(m.nombre)}</h1>${badgeHoy(m)}</div>
              <p class="medico-esp">${esc(m.especialidad)}</p>
              ${badgeVerificado(m)}
              <ul class="medico-datos">
                <li>${Icon("ubicacion")}${esc(m.departamento)}</li>
                <li>${Icon("idioma")}${esc(m.idiomas.join(", "))}</li>
                <li>${Icon("estrella", "relleno icono-maiz")}<strong>${m.calificacion.toFixed(1)}</strong>&nbsp;(${m.consultas} consultas)</li>
              </ul>
            </div>
          </div>
          <div class="tarjeta">
            <h2 class="h3">${m.nombre.startsWith("Licda") ? "Acerca de la licenciada" : m.nombre.startsWith("Dra") ? "Acerca de la doctora" : "Acerca del doctor"}</h2>
            <p>${esc(m.descripcion)}</p>
          </div>
          <div class="tarjeta">
            <h2 class="h3">Lo que dicen sus pacientes</h2>
            <ul class="resenas">
              ${DATA.resenas.map((r) => `<li>
                <div class="resena-cabecera">${estrellas(r.estrellas)}<span>${esc(r.autor)} · ${esc(r.lugar)}</span></div>
                <p>${esc(r.texto)}</p></li>`).join("")}
            </ul>
          </div>
        </div>

        <aside class="tarjeta agenda" aria-label="Agendar consulta">
          <h2 class="h3">Agenda tu consulta</h2>
          <p class="etiqueta">1. Elige una fecha</p>
          <div class="dias" role="group" aria-label="Fechas disponibles">
            ${dias.map((d) => { const f = iso(d); const ok = diaDisponible(f); return `
              <button type="button" class="dia" data-fecha="${f}" ${ok ? "" : "disabled"} aria-pressed="${f === fechaSel}">
                <small>${esHoy(f) ? "Hoy" : cap(d.toLocaleDateString("es-GT", { weekday: "short" }).replace(".", ""))}</small>
                <strong>${d.getDate()}</strong>
                <small>${d.toLocaleDateString("es-GT", { month: "short" }).replace(".", "")}</small>
              </button>`; }).join("")}
          </div>
          ${m.disponibleHoy ? "" : `<p class="nota">Sin horarios disponibles hoy. Elige otro día.</p>`}
          <p class="etiqueta">2. Elige un horario</p>
          <div class="horarios" id="horarios" role="group" aria-label="Horarios"></div>
          <div class="campo">
            <label class="etiqueta" for="motivo">3. Motivo de la consulta</label>
            <input id="motivo" maxlength="80" placeholder="Ej.: dolor de garganta desde hace 3 días" value="${esc(previa && previa.medicoId === m.id ? previa.motivo : "")}">
          </div>
          <div class="agenda-total"><span>Total</span><strong>${quetzales(m.precio)}</strong></div>
          <button class="btn btn-bloque btn-grande" id="btn-agendar" type="button" disabled>Agendar consulta</button>
          <p class="nota" id="nota-agenda">Elige fecha y hora para continuar.</p>
        </aside>
      </div>
    </div></section>`,
    montar(raiz) {
      const cont = raiz.querySelector("#horarios");
      const btn = raiz.querySelector("#btn-agendar");
      const nota = raiz.querySelector("#nota-agenda");

      function pintarHorarios() {
        if (!fechaSel) {
          cont.innerHTML = `<p class="nota">Primero elige una fecha.</p>`;
        } else {
          cont.innerHTML = m.horarios.map((h) => {
            const no = ocupado(fechaSel, h);
            return `<button type="button" class="hora" data-hora="${h}" ${no ? "disabled aria-label='" + h + " ocupado'" : ""} aria-pressed="${h === horaSel}">${h}</button>`;
          }).join("");
        }
        btn.disabled = !(fechaSel && horaSel);
        nota.textContent = fechaSel && horaSel
          ? `${fechaLarga(fechaSel)} a las ${horaSel}.`
          : "Elige fecha y hora para continuar.";
      }

      raiz.querySelectorAll(".dia").forEach((b) => b.addEventListener("click", () => {
        fechaSel = b.dataset.fecha;
        if (horaSel && ocupado(fechaSel, horaSel)) horaSel = null;
        raiz.querySelectorAll(".dia").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        pintarHorarios();
      }));

      cont.addEventListener("click", (e) => {
        const b = e.target.closest(".hora");
        if (!b || b.disabled) return;
        horaSel = b.dataset.hora;
        pintarHorarios();
      });

      btn.addEventListener("click", () => {
        State.set({
          citaActual: { medicoId: m.id, fecha: fechaSel, hora: horaSel, motivo: raiz.querySelector("#motivo").value.trim() },
          pago: null, pagado: false, consultaTerminada: false, encuesta: null
        });
        Router.ir("/pago");
      });

      pintarHorarios();
    }
  };
};

/* ---------- 6.5 Pago ---------- */

function exitoPagoHtml(cita, m, s) {
  const tel = s.usuario && s.usuario.telefono ? ` al +502 ${esc(s.usuario.telefono)}` : "";
  return `
  <section class="seccion"><div class="contenedor contenedor-angosto">
    <div class="tarjeta exito">
      <div class="exito-icono">${Icon("check")}</div>
      <h1 class="titulo-tarjeta">Consulta agendada</h1>
      <p>Te enviamos la confirmación por WhatsApp${tel}. Referencia de pago <strong>${esc(s.pago ? s.pago.referencia : "PG-000000")}</strong>.</p>
      ${resumenCitaHtml(cita, m)}
      <div class="agenda-total"><span>Pagado</span><strong>${quetzales(m.precio)}</strong></div>
      <div class="acciones acciones-columna">
        <a class="btn btn-grande btn-bloque" href="#/espera">Entrar a la sala de espera</a>
        <button class="btn btn-sec btn-bloque" type="button" id="btn-recordatorio">${Icon("campana")}Agregar recordatorio</button>
      </div>
    </div>
  </div></section>`;
}

Views.pago = () => {
  const s = State.get();
  const m = s.citaActual && buscarMedico(s.citaActual.medicoId);
  if (!m) return { redirigir: "/medicos", mensaje: "Primero elige un médico y un horario." };
  const cita = s.citaActual;

  const montarExito = (raiz) => {
    raiz.querySelector("#btn-recordatorio").addEventListener("click", () =>
      toast(`Listo. Te enviaremos un recordatorio por WhatsApp 30 minutos antes de tu consulta.`));
  };

  if (s.pagado) return { titulo: "Consulta agendada", html: exitoPagoHtml(cita, m, s), montar: montarExito };

  const etiquetaPago = `Pagar ${quetzales(m.precio)}`;
  return {
    titulo: "Pago",
    html: encabezadoPagina("Pago", "Revisa los datos de tu consulta y elige cómo pagar.") + `
    <section class="seccion seccion-compacta"><div class="contenedor pago">
      <div class="tarjeta">
        <h2 class="h3">Método de pago</h2>
        <div class="metodos" role="radiogroup" aria-label="Método de pago">
          <label class="metodo"><input type="radio" name="metodo" value="tarjeta" checked>${Icon("tarjeta")}<span><strong>Tarjeta</strong><small>Débito o crédito</small></span></label>
          <label class="metodo"><input type="radio" name="metodo" value="recurrente">${Icon("billete")}<span><strong>Pago con Recurrente</strong><small>Pasarela de pago local</small></span></label>
          <label class="metodo"><input type="radio" name="metodo" value="agencia">${Icon("agencia")}<span><strong>Pago en agencia</strong><small>Efectivo en agencia bancaria</small></span></label>
        </div>

        <div data-panel="tarjeta" class="panel-metodo">
          <div class="campo"><label for="p-num">Número de tarjeta</label><input id="p-num" inputmode="numeric" value="4242 4242 4242 4242" autocomplete="off"></div>
          <div class="fila-campos">
            <div class="campo"><label for="p-exp">Vencimiento</label><input id="p-exp" value="12/29" autocomplete="off"></div>
            <div class="campo"><label for="p-cvv">CVV</label><input id="p-cvv" inputmode="numeric" value="123" autocomplete="off"></div>
          </div>
          <div class="campo"><label for="p-titular">Nombre en la tarjeta</label><input id="p-titular" value="${esc(nombrePaciente())}" autocomplete="off"></div>
        </div>
        <div data-panel="recurrente" class="panel-metodo" hidden>
          <p>Al pagar, se abrirá la pasarela segura de Recurrente para completar el cobro con tarjeta local o transferencia. En este prototipo la pasarela está simulada.</p>
        </div>
        <div data-panel="agencia" class="panel-metodo" hidden>
          <p>Paga en efectivo en cualquier agencia bancaria con este código. Tu consulta queda reservada por 24 horas.</p>
          <p class="codigo-grande">4815 2026 0930</p>
        </div>

        <p class="aviso-demo">${Icon("candado")}Modo demostración: no se realiza ningún cobro.</p>
        <button class="btn btn-bloque btn-grande" id="btn-pagar" type="button">${etiquetaPago}</button>
      </div>

      <aside class="tarjeta resumen">
        <h2 class="h3">Resumen</h2>
        ${resumenCitaHtml(cita, m)}
        <div class="desglose">
          <div><span>Videoconsulta</span><span>${quetzales(m.precio)}</span></div>
          <div><span>Receta electrónica</span><span>Incluida</span></div>
        </div>
        <div class="agenda-total"><span>Total</span><strong>${quetzales(m.precio)}</strong></div>
        <a class="enlace" href="#/medico/${m.id}">Cambiar fecha u hora</a>
      </aside>
    </div></section>`,
    montar(raiz) {
      raiz.querySelectorAll('input[name="metodo"]').forEach((r) => r.addEventListener("change", () => {
        raiz.querySelectorAll("[data-panel]").forEach((p) => (p.hidden = p.dataset.panel !== r.value));
      }));
      const btn = raiz.querySelector("#btn-pagar");
      btn.addEventListener("click", () => {
        const metodo = raiz.querySelector('input[name="metodo"]:checked').value;
        btn.disabled = true;
        btn.classList.add("procesando");
        btn.innerHTML = `<span class="spinner" aria-hidden="true"></span>Procesando pago…`;
        setTimeout(() => {
          const actual = State.set({
            pagado: true,
            pago: { metodo, monto: m.precio, referencia: "PG-" + String(100000 + (hashTexto(cita.fecha + cita.hora) % 900000)) }
          });
          if (location.hash !== "#/pago") return;
          raiz.innerHTML = exitoPagoHtml(cita, m, actual);
          document.title = "Consulta agendada — Vitalia";
          window.scrollTo(0, 0);
          montarExito(raiz);
          raiz.querySelector(".exito").classList.add("animar");
        }, 1500);
      });
    }
  };
};

/* ---------- 6.6 Sala de espera ---------- */

Views.espera = (ctx) => {
  const { cita, medico: m } = citaOEjemplo();
  const paciente = nombrePaciente();
  return {
    titulo: "Sala de espera",
    html: encabezadoPagina("Sala de espera", `Consulta de ${esc(m.especialidad.toLowerCase())} · ${esc(fechaLarga(cita.fecha))}, ${esc(cita.hora)}`) + `
    <section class="seccion seccion-compacta"><div class="contenedor espera">
      <div class="tarjeta espera-principal">
        <div class="cuenta-regresiva" aria-live="polite">
          <div class="cuenta-circulo"><span id="cuenta">5</span><small>seg</small></div>
          <div>
            <p class="espera-mensaje" id="espera-msg">${esc(articulo(m))} ${esc(m.nombre)} se unirá en unos momentos.</p>
            <p class="nota">Mientras tanto, revisa tu cámara y tu micrófono.</p>
          </div>
        </div>
        <button class="btn btn-grande btn-bloque" id="btn-entrar-consulta" type="button" disabled>Entrar a la consulta</button>
      </div>

      <div class="tarjeta">
        <h2 class="h3">Prueba de cámara y micrófono</h2>
        <div class="previa-camara" id="previa">
          ${avatar(paciente, "avatar-xl")}
          <p>Tu cámara aún no está activa.</p>
        </div>
        <button class="btn btn-sec btn-bloque" id="btn-camara" type="button">${Icon("video")}Probar cámara</button>
      </div>

      <div class="tarjeta">
        <h2 class="h3">Calidad de conexión</h2>
        <div class="conexion" id="conexion" data-nivel="3">
          <span class="barras" aria-hidden="true"><i></i><i></i><i></i></span>
          <strong id="conexion-txt">Buena</strong>
        </div>
        <p class="nota" id="conexion-nota">Tu conexión es suficiente para videollamada.</p>
      </div>
    </div></section>`,
    montar(raiz) {
      let restante = 5;
      const cuenta = raiz.querySelector("#cuenta");
      const btnEntrar = raiz.querySelector("#btn-entrar-consulta");
      const intervalo = ctx.repetir(() => {
        restante -= 1;
        cuenta.textContent = Math.max(restante, 0);
        if (restante <= 0) {
          clearInterval(intervalo);
          raiz.querySelector("#espera-msg").textContent = `${articulo(m)} ${m.nombre} ya está en la sala.`;
          raiz.querySelector(".cuenta-circulo").classList.add("listo");
          btnEntrar.disabled = false;
          btnEntrar.focus();
        }
      }, 1000);
      btnEntrar.addEventListener("click", () => Router.ir("/consulta"));

      const previa = raiz.querySelector("#previa");
      const btnCam = raiz.querySelector("#btn-camara");
      function mostrarVideo(stream) {
        previa.innerHTML = `<video autoplay muted playsinline></video><span class="etiqueta-video">${Icon("check")}Cámara y micrófono listos</span>`;
        previa.querySelector("video").srcObject = stream;
        btnCam.hidden = true;
      }
      if (Media.stream) mostrarVideo(Media.stream);
      btnCam.addEventListener("click", async () => {
        btnCam.disabled = true;
        btnCam.textContent = "Solicitando permiso…";
        try {
          mostrarVideo(await Media.pedir());
        } catch (e) {
          previa.innerHTML = `${avatar(paciente, "avatar-xl")}<p><strong>Sin cámara. Puedes continuar solo con audio.</strong></p>`;
          btnCam.disabled = false;
          btnCam.innerHTML = `${Icon("video")}Intentar de nuevo`;
        }
      });

      // Conexión simulada: mayormente buena, a veces regular o baja
      const niveles = [
        { n: 3, t: "Buena", nota: "Tu conexión es suficiente para videollamada." },
        { n: 2, t: "Regular", nota: "Puede haber pausas en el video." },
        { n: 1, t: "Baja", nota: "Te recomendamos activar el modo baja conexión (solo audio) en la consulta." }
      ];
      const secuencia = [0, 0, 1, 0, 0, 2, 1, 0];
      let paso = 0;
      ctx.repetir(() => {
        paso = (paso + 1) % secuencia.length;
        const nv = niveles[secuencia[paso]];
        raiz.querySelector("#conexion").dataset.nivel = nv.n;
        raiz.querySelector("#conexion-txt").textContent = nv.t;
        raiz.querySelector("#conexion-nota").textContent = nv.nota;
      }, 2500);
    }
  };
};

/* ---------- 6.7 Videoconsulta ---------- */

Views.consulta = (ctx) => {
  const { cita, medico: m } = citaOEjemplo();
  const paciente = nombrePaciente();
  const motivo = cita.motivo ? ` Veo que el motivo de la consulta es: "${cita.motivo}".` : "";
  const receta = DATA.recetas[m.especialidad];
  const mensajesMedico = [
    { t: 3000, texto: `Hola, ${primerNombre(paciente)}. Soy ${articulo(m).toLowerCase()} ${m.nombre}.${motivo} ¿Desde cuándo tienes las molestias?` },
    { t: 8000, texto: "Entiendo. ¿Has tenido fiebre, o alguna alergia a medicamentos que deba saber?" },
    { t: 14000, texto: `Gracias. Por lo que me describes, parece ${receta.diagnostico.toLowerCase().split(" — ")[0]}. Al terminar te envío la receta electrónica.` }
  ];

  return {
    titulo: "Videoconsulta",
    html: `
    <section class="consulta-pagina"><div class="contenedor consulta">
      <div class="llamada">
        <div class="escenario" id="escenario">
          <div class="escenario-sup">
            <span class="en-vivo"><span class="vp-punto"></span><span id="temporizador">00:00</span></span>
            <span class="calidad" id="calidad">${Icon("wifi")}Video HD</span>
          </div>
          <div class="escenario-medico">
            ${avatar(m.nombre, "avatar-xxl")}
            <p class="escenario-nombre">${esc(m.nombre)}<small>${esc(m.especialidad)} · Colegiado ${esc(m.colegiado)}</small></p>
          </div>
          <div class="solo-audio" hidden>
            ${Icon("audio", "icono-xl")}
            <p><strong>Solo audio</strong><small>Modo baja conexión activo: el video está pausado para ahorrar datos.</small></p>
          </div>
          <div class="pip" id="pip"></div>
        </div>
        <div class="controles" role="toolbar" aria-label="Controles de la llamada">
          <button type="button" class="control" id="c-mic" aria-pressed="false">${Icon("mic")}<span>Silenciar</span></button>
          <button type="button" class="control" id="c-cam" aria-pressed="false">${Icon("video")}<span>Cámara</span></button>
          <button type="button" class="control" id="c-baja" aria-pressed="false">${Icon("audio")}<span>Modo baja conexión</span></button>
          <button type="button" class="control control-colgar" id="c-fin">${Icon("colgar")}<span>Terminar consulta</span></button>
        </div>
      </div>

      <aside class="chat" aria-label="Chat de la consulta">
        <h2 class="h3 chat-titulo">${Icon("chat")}Chat</h2>
        <div class="chat-mensajes" id="chat" aria-live="polite">
          <p class="chat-sistema">La conversación está cifrada de extremo a extremo.</p>
        </div>
        <form class="chat-form" id="chat-form">
          <label for="chat-input" class="solo-lector">Escribe un mensaje</label>
          <input id="chat-input" placeholder="Escribe un mensaje…" autocomplete="off">
          <button class="btn" type="submit" aria-label="Enviar">${Icon("enviar")}</button>
        </form>
      </aside>
    </div></section>`,
    montar(raiz) {
      const escenario = raiz.querySelector("#escenario");
      const pip = raiz.querySelector("#pip");
      const chat = raiz.querySelector("#chat");
      let micApagado = false, camApagada = false, baja = false;

      // Temporizador
      const inicio = Date.now();
      const tempo = raiz.querySelector("#temporizador");
      ctx.repetir(() => {
        const s = Math.floor((Date.now() - inicio) / 1000);
        tempo.textContent = `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
      }, 1000);

      function pintarPip() {
        const conVideo = Media.stream && !camApagada && Media.pistas("video").length;
        pip.hidden = baja;
        if (conVideo) {
          if (!pip.querySelector("video")) {
            pip.innerHTML = `<video autoplay muted playsinline></video><small>Tú</small>`;
            pip.querySelector("video").srcObject = Media.stream;
          }
        } else {
          pip.innerHTML = `${avatar(paciente)}<small>${camApagada ? "Cámara apagada" : "Tú · sin video"}</small>`;
        }
      }
      pintarPip();

      function agregarMensaje(texto, deMedico) {
        const hora = new Date().toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit" });
        const div = document.createElement("div");
        div.className = "burbuja " + (deMedico ? "burbuja-medico" : "burbuja-paciente");
        div.innerHTML = `${deMedico ? `<strong>${esc(m.nombre)}</strong>` : ""}<p>${esc(texto)}</p><small>${hora}</small>`;
        chat.appendChild(div);
        chat.scrollTop = chat.scrollHeight;
      }
      mensajesMedico.forEach((msg) => ctx.esperar(() => agregarMensaje(msg.texto, true), msg.t));

      raiz.querySelector("#chat-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const input = raiz.querySelector("#chat-input");
        if (!input.value.trim()) return;
        agregarMensaje(input.value.trim(), false);
        input.value = "";
      });

      const bMic = raiz.querySelector("#c-mic");
      bMic.addEventListener("click", () => {
        micApagado = !micApagado;
        Media.pistas("audio").forEach((t) => (t.enabled = !micApagado));
        bMic.setAttribute("aria-pressed", String(micApagado));
        bMic.innerHTML = `${Icon(micApagado ? "micOff" : "mic")}<span>${micApagado ? "Activar micrófono" : "Silenciar"}</span>`;
      });

      const bCam = raiz.querySelector("#c-cam");
      bCam.addEventListener("click", async () => {
        if (!Media.stream && !camApagada) {
          try { await Media.pedir(); pintarPip(); return; }
          catch (e) { toast("No se detectó cámara. La consulta sigue solo con audio."); camApagada = true; }
        } else {
          camApagada = !camApagada;
        }
        Media.pistas("video").forEach((t) => (t.enabled = !camApagada));
        bCam.setAttribute("aria-pressed", String(camApagada));
        bCam.innerHTML = `${Icon(camApagada ? "videoOff" : "video")}<span>${camApagada ? "Encender cámara" : "Cámara"}</span>`;
        pip.innerHTML = "";
        pintarPip();
      });

      const bBaja = raiz.querySelector("#c-baja");
      bBaja.addEventListener("click", () => {
        baja = !baja;
        escenario.classList.toggle("modo-baja", baja);
        escenario.querySelector(".escenario-medico").hidden = baja;
        escenario.querySelector(".solo-audio").hidden = !baja;
        raiz.querySelector("#calidad").innerHTML = baja ? `${Icon("audio")}Solo audio` : `${Icon("wifi")}Video HD`;
        bBaja.setAttribute("aria-pressed", String(baja));
        pintarPip();
        toast(baja ? "Modo baja conexión activado: solo audio." : "Video reactivado.");
      });

      raiz.querySelector("#c-fin").addEventListener("click", () => {
        State.set({ consultaTerminada: true });
        Media.detener();
        Router.ir("/receta");
      });
    }
  };
};

/* ---------- 6.8 Resumen y receta electrónica ---------- */

function qrSvg(texto) {
  const n = 25;
  let semilla = hashTexto(texto) || 1;
  const azar = () => { semilla = (semilla * 1103515245 + 12345) & 0x7fffffff; return semilla / 0x7fffffff; };
  const enBuscador = (x, y) => (x < 8 && y < 8) || (x >= n - 8 && y < 8) || (x < 8 && y >= n - 8);
  let d = "";
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    if (!enBuscador(x, y) && azar() < 0.48) d += `M${x} ${y}h1v1h-1z`;
  }
  const buscador = (x, y) => `M${x} ${y}h7v7h-7zM${x + 1} ${y + 1}v5h5v-5zM${x + 2} ${y + 2}h3v3h-3z`;
  d += buscador(0, 0) + buscador(n - 7, 0) + buscador(0, n - 7);
  return `<svg class="qr" viewBox="-2 -2 ${n + 4} ${n + 4}" role="img" aria-label="Código QR de verificación (decorativo)" shape-rendering="crispEdges">
    <rect x="-2" y="-2" width="${n + 4}" height="${n + 4}" fill="#fff"/><path d="${d}" fill="#16232B" fill-rule="evenodd"/></svg>`;
}

Views.receta = () => {
  const s = State.get();
  const { cita, medico: m } = citaOEjemplo();
  const r = DATA.recetas[m.especialidad];
  const paciente = nombrePaciente();
  const codigo = "VT-2026-004812";
  const fecha = fechaLarga(cita.fecha);

  const textoWhatsApp = [
    "Receta electrónica Vitalia",
    `Código: ${codigo}`,
    `Paciente: ${paciente}`,
    `Médico: ${m.nombre} (colegiado ${m.colegiado})`,
    `Diagnóstico: ${r.diagnostico}`,
    ...r.items.map((it, i) => `${i + 1}. ${it.nombre} — ${it.dosis} — ${it.duracion}`),
    "(Prototipo de demostración — datos ficticios)"
  ].join("\n");

  return {
    titulo: "Receta electrónica",
    html: encabezadoPagina("Resumen de tu consulta", `${esc(m.nombre)} · ${esc(fecha)}`) + `
    <section class="seccion seccion-compacta"><div class="contenedor receta-layout">
      <div>
        <article class="tarjeta receta-doc" id="receta-doc">
          <header class="receta-cabecera">
            <div class="logo">${logoSvg()}<span>Vitalia</span></div>
            <div class="texto-derecha"><strong>Receta electrónica</strong><small>${esc(fecha)}</small></div>
          </header>
          <div class="receta-partes">
            <div><span class="etiqueta">Médico</span><p>${esc(m.nombre)}<small>${esc(m.especialidad)} · Colegiado No. ${esc(m.colegiado)}</small></p></div>
            <div><span class="etiqueta">Paciente</span><p>${esc(paciente)}<small>${DATA.paciente.edad} años · Sangre ${DATA.paciente.sangre}</small></p></div>
          </div>
          <div class="receta-diagnostico"><span class="etiqueta">Diagnóstico</span><p class="diagnostico">${esc(r.diagnostico)}</p></div>
          <div class="tabla-scroll">
            <table class="tabla">
              <thead><tr><th scope="col">Medicamento o indicación</th><th scope="col">Dosis</th><th scope="col">Duración</th></tr></thead>
              <tbody>${r.items.map((it) => `<tr><td><strong>${esc(it.nombre)}</strong></td><td>${esc(it.dosis)}</td><td>${esc(it.duracion)}</td></tr>`).join("")}</tbody>
            </table>
          </div>
          <p class="receta-nota">${Icon("info")}${esc(r.nota)}</p>
          <footer class="receta-pie">
            ${qrSvg(codigo)}
            <div>
              <span class="etiqueta">Código de verificación</span>
              <p class="codigo-grande">${codigo}</p>
              <p class="nota">Firmado electrónicamente por ${esc(m.nombre)}. La farmacia puede verificar esta receta con el código o el QR.</p>
              <p class="nota nota-demo">Receta ficticia generada para la demostración. No válida para uso médico.</p>
            </div>
          </footer>
        </article>

        <div class="acciones no-imprimir">
          <button class="btn" type="button" id="btn-imprimir">${Icon("descargar")}Descargar receta</button>
          <a class="btn btn-sec" href="https://wa.me/?text=${encodeURIComponent(textoWhatsApp)}" target="_blank" rel="noopener">${Icon("chat")}Enviar por WhatsApp</a>
          <button class="btn btn-sec" type="button" id="btn-farmacias" aria-expanded="false" aria-controls="farmacias">${Icon("farmacia")}Ver farmacias aliadas</button>
        </div>

        <div class="tarjeta no-imprimir" id="farmacias" hidden>
          <h2 class="h3">Farmacias aliadas</h2>
          <ul class="farmacias">
            ${DATA.farmacias.map((f) => `<li>
              <span class="especialidad-icono">${Icon("farmacia")}</span>
              <div><strong>${esc(f.nombre)}</strong><small>${esc(f.lugar)}</small></div>
              <span class="cupon">${esc(f.descuento)} con <strong>${esc(f.cupon)}</strong></span>
            </li>`).join("")}
          </ul>
        </div>
      </div>

      <aside class="tarjeta encuesta no-imprimir" id="encuesta">
        ${s.encuesta ? encuestaGracias() : `
        <h2 class="h3">¿Cómo estuvo tu consulta?</h2>
        <p class="etiqueta" id="lbl-estrellas">Califica a ${esc(m.nombre)}</p>
        <div class="selector-estrellas" role="group" aria-labelledby="lbl-estrellas">
          ${[1, 2, 3, 4, 5].map((i) => `<button type="button" data-estrella="${i}" aria-label="${i} estrella${i > 1 ? "s" : ""}" aria-pressed="false">${Icon("estrella")}</button>`).join("")}
        </div>
        <p class="etiqueta" id="lbl-nps">¿Recomendarías Vitalia? (0 = nada probable, 10 = muy probable)</p>
        <div class="selector-nps" role="group" aria-labelledby="lbl-nps">
          ${Array.from({ length: 11 }, (_, i) => `<button type="button" data-nps="${i}" aria-pressed="false">${i}</button>`).join("")}
        </div>
        <button class="btn btn-bloque" type="button" id="btn-encuesta" disabled>Enviar opinión</button>`}
      </aside>
    </div></section>`,
    montar(raiz) {
      raiz.querySelector("#btn-imprimir").addEventListener("click", () => window.print());
      const bf = raiz.querySelector("#btn-farmacias");
      bf.addEventListener("click", () => {
        const panel = raiz.querySelector("#farmacias");
        panel.hidden = !panel.hidden;
        bf.setAttribute("aria-expanded", String(!panel.hidden));
        if (!panel.hidden) panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });

      const enc = raiz.querySelector("#encuesta");
      if (s.encuesta) return;
      let est = 0, nps = null;
      const btnEnviar = enc.querySelector("#btn-encuesta");
      const actualizar = () => {
        enc.querySelectorAll("[data-estrella]").forEach((b) => {
          const on = Number(b.dataset.estrella) <= est;
          b.classList.toggle("activa", on);
          b.setAttribute("aria-pressed", String(Number(b.dataset.estrella) === est));
        });
        enc.querySelectorAll("[data-nps]").forEach((b) => b.setAttribute("aria-pressed", String(Number(b.dataset.nps) === nps)));
        btnEnviar.disabled = !(est && nps !== null);
      };
      enc.addEventListener("click", (e) => {
        const be = e.target.closest("[data-estrella]");
        const bn = e.target.closest("[data-nps]");
        if (be) est = Number(be.dataset.estrella);
        if (bn) nps = Number(bn.dataset.nps);
        if (be || bn) actualizar();
      });
      btnEnviar.addEventListener("click", () => {
        State.set({ encuesta: { estrellas: est, nps } });
        enc.innerHTML = encuestaGracias();
      });
    }
  };
};

function encuestaGracias() {
  return `<div class="gracias">${Icon("corazon", "icono-xl")}<h2 class="h3">Gracias, tu opinión llegó al equipo de calidad.</h2>
    <p class="nota">Tu consulta ya está guardada en tu expediente.</p>
    <a class="btn btn-sec btn-bloque" href="#/expediente">Ver mi expediente</a></div>`;
}

/* ---------- 6.9 Mi expediente ---------- */

Views.expediente = () => {
  const s = State.get();
  const p = DATA.paciente;
  const nombre = nombrePaciente();
  const depto = (s.usuario && s.usuario.departamento) || p.departamento;
  const m = s.citaActual && buscarMedico(s.citaActual.medicoId);
  const r = m && DATA.recetas[m.especialidad];

  let actual = "";
  if (m) {
    const estado = s.consultaTerminada ? ["Completada", "estado-ok"] : s.pagado ? ["Agendada y pagada", "estado-info"] : ["Pendiente de pago", "estado-pendiente"];
    actual = `<li class="linea-item linea-nueva">
      <span class="linea-punto"></span>
      <div class="tarjeta">
        <div class="linea-cabecera"><strong>${esc(fechaCorta(s.citaActual.fecha))} · ${esc(s.citaActual.hora)}</strong><span class="badge ${estado[1]}">${estado[0]}</span></div>
        <h3>${esc(s.citaActual.motivo || "Consulta de " + m.especialidad.toLowerCase())}</h3>
        <p class="nota">${esc(m.nombre)} · ${esc(m.especialidad)}</p>
        ${s.consultaTerminada
          ? `<p>Diagnóstico: <strong>${esc(r.diagnostico)}</strong>. Receta VT-2026-004812.</p><a class="enlace" href="#/receta">Ver receta</a>`
          : s.pagado ? `<a class="enlace" href="#/espera">Ir a la sala de espera</a>` : `<a class="enlace" href="#/pago">Completar pago</a>`}
      </div>
    </li>`;
  }

  const medicamentos = [...p.medicamentos];
  if (m && s.consultaTerminada) r.items.forEach((it) => medicamentos.unshift({ nombre: it.nombre, dosis: `${it.dosis} · ${it.duracion}`, nuevo: true }));

  return {
    titulo: "Mi expediente",
    html: `
    <section class="encabezado-pagina"><div class="contenedor expediente-cabecera">
      ${avatar(nombre, "avatar-xl")}
      <div>
        <h1>${esc(nombre)}</h1>
        <ul class="medico-datos">
          <li>${Icon("usuario")}${p.edad} años</li>
          <li>${Icon("piel")}Sangre ${p.sangre}</li>
          <li>${Icon("ubicacion")}${esc(depto)}</li>
        </ul>
      </div>
    </div></section>
    <section class="seccion seccion-compacta"><div class="contenedor expediente">
      <div>
        <h2>Historial de consultas</h2>
        <ol class="linea-tiempo">
          ${actual}
          ${p.historial.map((h) => `<li class="linea-item">
            <span class="linea-punto"></span>
            <div class="tarjeta">
              <div class="linea-cabecera"><strong>${esc(fechaCorta(h.fecha))}</strong><span class="badge estado-ok">Completada</span></div>
              <h3>${esc(h.motivo)}</h3>
              <p class="nota">${esc(h.medico)} · ${esc(h.especialidad)}</p>
              <p>${esc(h.resultado)}</p>
            </div>
          </li>`).join("")}
        </ol>
        ${m ? "" : `<p class="nota">Aún no tienes consultas nuevas. <a class="enlace" href="#/medicos">Buscar médico</a></p>`}
      </div>
      <aside class="expediente-lateral">
        <div class="tarjeta">
          <h2 class="h3">${Icon("info")}Alergias</h2>
          <ul class="lista-simple">${p.alergias.map((a) => `<li><span class="badge estado-alerta">${esc(a)}</span></li>`).join("")}</ul>
        </div>
        <div class="tarjeta">
          <h2 class="h3">${Icon("pastilla")}Medicamentos actuales</h2>
          <ul class="lista-simple">${medicamentos.map((x) => `<li><strong>${esc(x.nombre)}</strong>${x.nuevo ? ` <span class="badge badge-hoy">Nuevo</span>` : ""}<small>${esc(x.dosis)}</small></li>`).join("")}</ul>
        </div>
        <div class="tarjeta">
          <h2 class="h3">${Icon("archivo")}Resultados de laboratorio</h2>
          <ul class="lista-simple">${p.laboratorios.map((l) => `<li class="archivo"><span>${Icon("archivo")}</span><div><strong>${esc(l.nombre)}</strong><small>${esc(l.archivo)} · ${esc(l.fecha)}</small></div></li>`).join("")}</ul>
        </div>
        <div class="tarjeta tarjeta-info">
          ${Icon("candado")}
          <p>Tu expediente está cifrado y solo lo ven los médicos que atiendes.</p>
        </div>
      </aside>
    </div></section>`
  };
};

/* ---------- 6.10 Panel del médico ---------- */

Views.panelMedico = () => {
  const s = State.get();
  const m = (s.citaActual && buscarMedico(s.citaActual.medicoId)) || buscarMedico("m01");
  const h = new Date().getHours();
  const saludo = h < 12 ? "Buenos días" : h < 19 ? "Buenas tardes" : "Buenas noches";
  const consultasMes = 86;
  const ingresos = consultasMes * m.precio * 0.8;

  const citas = DATA.agendaMedico.map((c) => ({ ...c, fecha: iso(new Date()) }));
  if (s.citaActual && s.citaActual.medicoId === m.id) {
    citas.unshift({
      hora: s.citaActual.hora, fecha: s.citaActual.fecha, paciente: nombreCorto(nombrePaciente()),
      motivo: s.citaActual.motivo || "Consulta general", demo: true,
      estado: s.consultaTerminada ? "Atendida" : s.pagado ? "Pagada" : "Pendiente de pago"
    });
  }
  const proxima = citas.findIndex((c) => c.estado !== "Atendida");

  return {
    titulo: "Panel del médico",
    html: `
    <section class="encabezado-pagina"><div class="contenedor panel-cabecera">
      ${avatar(m.nombre, "avatar-xl")}
      <div>
        <p class="eyebrow">${saludo}</p>
        <h1>${esc(m.nombre)}</h1>
        <span class="badge badge-verificado">${Icon("verificado")}Colegiado ${esc(m.colegiado)} · Verificado — vigente hasta 12/2026</span>
      </div>
      <label class="interruptor panel-disponible">
        <input type="checkbox" role="switch" checked id="sw-disponible">
        <span class="interruptor-pista" aria-hidden="true"></span>
        <span>Disponible para consultas</span>
      </label>
    </div></section>
    <section class="seccion seccion-compacta"><div class="contenedor">
      <div class="indicadores">
        <div class="indicador">${Icon("video")}<span>Consultas del mes</span><strong>${consultasMes}</strong></div>
        <div class="indicador">${Icon("estrella")}<span>Calificación promedio</span><strong>${m.calificacion.toFixed(1)} <small>/ 5</small></strong></div>
        <div class="indicador">${Icon("billete")}<span>Ingresos del mes</span><strong>${quetzales(ingresos)}</strong><small>Después de la comisión de Vitalia (20 %)</small></div>
      </div>

      <h2>Agenda</h2>
      <ul class="agenda-lista">
        ${citas.map((c, i) => `<li class="cita ${c.demo ? "cita-demo" : ""} ${i === proxima ? "cita-proxima" : ""}">
          <div class="cita-hora"><strong>${esc(c.hora)}</strong><small>${esHoy(c.fecha) ? "Hoy" : esc(fechaCorta(c.fecha))}</small></div>
          <div class="cita-info">
            <strong>${esc(c.paciente)}</strong> ${c.demo ? `<span class="badge badge-hoy">Agendada en la demo</span>` : ""} ${c.estado ? `<span class="badge estado-info">${esc(c.estado)}</span>` : ""}
            <p class="nota">${esc(c.motivo)}</p>
          </div>
          ${i === proxima ? `<a class="btn" href="#/consulta">${Icon("video")}Iniciar consulta</a>` : `<span class="nota">Programada</span>`}
        </li>`).join("")}
      </ul>
    </div></section>`,
    montar(raiz) {
      raiz.querySelector("#sw-disponible").addEventListener("change", (e) =>
        toast(e.target.checked ? "Apareces como disponible para nuevos pacientes." : "Ya no recibirás nuevas citas hoy."));
    }
  };
};

/* ---------- 6.11 Panel de empresa ---------- */

Views.empresa = () => {
  const e = DATA.empresa;
  const max = Math.max(...e.especialidades.map((x) => x.valor));
  const porcentaje = (a, b) => Math.round((a / b) * 100);
  return {
    titulo: "Panel de empresa",
    html: `
    <section class="encabezado-pagina"><div class="contenedor panel-cabecera">
      <span class="avatar avatar-xl avatar-cuadrado" aria-hidden="true">${Icon("edificio")}</span>
      <div>
        <p class="eyebrow">Plan Empresas · ${quetzales(60)} por empleado al mes</p>
        <h1>${esc(e.nombre)}</h1>
        <p class="subtitulo">${e.afiliados} empleados afiliados · Facturación mensual ${quetzales(e.afiliados * 60)}</p>
      </div>
    </div></section>
    <section class="seccion seccion-compacta"><div class="contenedor">
      <div class="indicadores">
        <div class="indicador">${Icon("usuarios")}<span>Empleados que usaron el servicio este mes</span><strong>${e.usaronMes} <small>de ${e.afiliados} (${porcentaje(e.usaronMes, e.afiliados)} %)</small></strong></div>
        <div class="indicador">${Icon("video")}<span>Consultas totales del mes</span><strong>${e.consultasMes}</strong></div>
        <div class="indicador">${Icon("reloj")}<span>Tiempo promedio para ser atendido</span><strong>${e.tiempoPromedio} min</strong></div>
      </div>

      <div class="dos-columnas dos-columnas-arriba">
        <div class="tarjeta">
          <h2 class="h3">Especialidades más usadas</h2>
          <ul class="barras-h">
            ${e.especialidades.map((x) => `<li>
              <span>${esc(x.nombre)}</span>
              <div class="barra-h"><i style="width:${(x.valor / max) * 100}%"></i></div>
              <strong>${x.valor}</strong>
            </li>`).join("")}
          </ul>
        </div>
        <div class="tarjeta">
          <h2 class="h3">Uso por área</h2>
          <div class="tabla-scroll">
            <table class="tabla">
              <thead><tr><th scope="col">Área</th><th scope="col">Afiliados</th><th scope="col">Usaron el servicio</th><th scope="col">Consultas</th><th scope="col">% de uso</th></tr></thead>
              <tbody>${e.areas.map((a) => `<tr><td>${esc(a.area)}</td><td>${a.afiliados}</td><td>${a.usaron}</td><td>${a.consultas}</td><td>${porcentaje(a.usaron, a.afiliados)} %</td></tr>`).join("")}</tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="tarjeta tarjeta-info">
        ${Icon("escudo")}
        <p>Solo mostramos datos agregados por área. Recursos Humanos nunca ve nombres, diagnósticos ni recetas de quienes consultan.</p>
      </div>
    </div></section>`
  };
};

/* ---------- 6.12 Métricas del proyecto ---------- */

function graficaBarras(valores, etiquetas, nombre) {
  const max = Math.max(...valores) * 1.1;
  return `<div class="grafica" role="img" aria-label="${esc(nombre)}: ${valores.map((v, i) => `${etiquetas[i]} ${v}`).join(", ")}">
    ${valores.map((v, i) => `<div class="grafica-col">
      <span class="grafica-valor">${v.toLocaleString("en-US")}</span>
      <div class="grafica-barra ${i === valores.length - 1 ? "ultima" : ""}" style="height:${(v / max) * 100}%"></div>
      <span class="grafica-etiqueta">${esc(etiquetas[i])}</span>
    </div>`).join("")}
  </div>`;
}

Views.kpis = () => {
  const k = DATA.kpis;
  const meses = ultimosMeses(6);
  const crec = (a) => Math.round((a[a.length - 1] / a[0] - 1) * 100);
  const tarjetas = [
    { icono: "corazon", nombre: "NPS", valor: k.nps, extra: "Excelente arriba de 50" },
    { icono: "ubicacion", nombre: "Usuarios de áreas rurales", valor: `${k.rurales} %`, extra: "Meta del año: 40 %" },
    { icono: "wifi", nombre: "Disponibilidad (uptime)", valor: `${k.uptime} %`, extra: "Meta: 99.9 %" },
    { icono: "reloj", nombre: "Tiempo para iniciar consulta", valor: `${k.tiempoInicio} min`, extra: "Promedio desde que se agenda" },
    { icono: "estetoscopio", nombre: "Médicos activos", valor: k.medicosActivos, extra: "Colegiado verificado" },
    { icono: "billete", nombre: "Relación LTV/CAC", valor: `${k.ltvCac.toFixed(1)}×`, extra: "Saludable arriba de 3×" },
    { icono: "usuarios", nombre: "Consultas subsidiadas", valor: k.subsidiadas, extra: "Para familias de escasos recursos" }
  ];
  return {
    titulo: "Métricas del proyecto",
    html: encabezadoPagina("Métricas del proyecto", "Indicadores clave de los últimos 6 meses.") + `
    <section class="seccion seccion-compacta"><div class="contenedor">
      <div class="kpis">
        ${tarjetas.map((t) => `<div class="indicador">${Icon(t.icono)}<span>${esc(t.nombre)}</span><strong>${esc(t.valor)}</strong><small>${esc(t.extra)}</small></div>`).join("")}
      </div>
      <div class="dos-columnas dos-columnas-arriba">
        <div class="tarjeta">
          <div class="grafica-cabecera"><h2 class="h3">Consultas por mes</h2><span class="badge estado-ok">+${crec(k.consultasMes)} % en 6 meses</span></div>
          ${graficaBarras(k.consultasMes, meses, "Consultas por mes")}
        </div>
        <div class="tarjeta">
          <div class="grafica-cabecera"><h2 class="h3">Usuarios nuevos por mes</h2><span class="badge estado-ok">+${crec(k.usuariosNuevosMes)} % en 6 meses</span></div>
          ${graficaBarras(k.usuariosNuevosMes, meses, "Usuarios nuevos por mes")}
        </div>
      </div>
      <p class="nota">Datos simulados para ilustrar las métricas definidas en el plan.</p>
    </div></section>`
  };
};

/* ---------- Ruta inexistente ---------- */

Views.noEncontrada = () => ({
  titulo: "Página no encontrada",
  html: `<section class="seccion"><div class="contenedor contenedor-angosto">
    <div class="tarjeta vacio">
      ${Icon("info", "icono-xl")}
      <h1 class="titulo-tarjeta">Esta página no existe.</h1>
      <a class="btn" href="#/">Volver al inicio</a>
    </div>
  </div></section>`
});

/* ---------- Logo ---------- */

function logoSvg() {
  return `<svg class="logo-marca" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="9" fill="#1F6F5C"/>
    <path d="M16 7c-4.5 3.2-6.5 7-6.5 10.5a6.5 6.5 0 0 0 13 0C22.5 14 20.5 10.2 16 7z" fill="#DCEDE7"/>
    <path d="M16 13v9M11.5 17.5h9" stroke="#1F6F5C" stroke-width="2.4" stroke-linecap="round"/></svg>`;
}
