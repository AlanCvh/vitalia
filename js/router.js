/* Vitalia — ruteo por hash (#/ruta?param=valor). Funciona abriendo index.html con file:// */

const Router = (() => {
  const rutas = [
    { patron: /^\/$/, vista: "inicio" },
    { patron: /^\/entrar$/, vista: "entrar" },
    { patron: /^\/medicos$/, vista: "medicos" },
    { patron: /^\/medico\/([\w-]+)$/, vista: "perfil" },
    { patron: /^\/pago$/, vista: "pago" },
    { patron: /^\/espera$/, vista: "espera" },
    { patron: /^\/consulta$/, vista: "consulta" },
    { patron: /^\/receta$/, vista: "receta" },
    { patron: /^\/expediente$/, vista: "expediente" },
    { patron: /^\/planes$/, vista: "planes" },
    { patron: /^\/panel-medico$/, vista: "panelMedico" },
    { patron: /^\/empresa$/, vista: "empresa" },
    { patron: /^\/kpis$/, vista: "kpis" }
  ];

  // Rutas en las que se conserva la cámara encendida
  const RUTAS_CON_CAMARA = ["/espera", "/consulta"];

  let limpiezas = [];
  let mensajePendiente = null;

  function leerHash() {
    const crudo = location.hash.replace(/^#/, "") || "/";
    const [ruta, qs] = crudo.split("?");
    return { ruta: ruta || "/", query: new URLSearchParams(qs || "") };
  }

  function ir(destino, mensaje) {
    if (mensaje) mensajePendiente = mensaje;
    const nuevo = "#" + destino;
    if (location.hash === nuevo) render();
    else location.hash = nuevo;
  }

  function limpiar() {
    limpiezas.forEach((fn) => { try { fn(); } catch (e) { /* nada */ } });
    limpiezas = [];
  }

  // Contexto que recibe cada vista: temporizadores que se limpian solos al cambiar de ruta
  function crearContexto(params, query) {
    return {
      params,
      query,
      alSalir: (fn) => limpiezas.push(fn),
      esperar: (fn, ms) => { const id = setTimeout(fn, ms); limpiezas.push(() => clearTimeout(id)); return id; },
      repetir: (fn, ms) => { const id = setInterval(fn, ms); limpiezas.push(() => clearInterval(id)); return id; }
    };
  }

  function render() {
    limpiar();
    const { ruta, query } = leerHash();
    if (!RUTAS_CON_CAMARA.includes(ruta)) Media.detener();

    let nombreVista = "noEncontrada";
    let params = [];
    for (const r of rutas) {
      const m = ruta.match(r.patron);
      if (m) { nombreVista = r.vista; params = m.slice(1); break; }
    }

    const ctx = crearContexto(params, query);
    const resultado = Views[nombreVista](ctx);

    if (resultado.redirigir) {
      ir(resultado.redirigir, resultado.mensaje);
      return;
    }

    const app = document.getElementById("app");
    const aviso = mensajePendiente
      ? `<div class="contenedor"><div class="aviso-flash" role="alert">${Icon("info")}<span>${esc(mensajePendiente)}</span></div></div>`
      : "";
    mensajePendiente = null;

    app.innerHTML = aviso + resultado.html;
    document.title = resultado.titulo ? `${resultado.titulo} — Vitalia` : "Vitalia — Tu médico, desde donde estés";
    if (resultado.montar) resultado.montar(app);

    actualizarEncabezado(ruta);
    window.scrollTo(0, 0);
    app.focus({ preventScroll: true });
  }

  function actualizarEncabezado(ruta) {
    document.querySelectorAll("[data-nav]").forEach((a) => {
      const destino = a.getAttribute("data-nav");
      const activo = destino === ruta || (destino === "/medicos" && ruta.startsWith("/medico"));
      a.classList.toggle("activo", activo);
      if (activo) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    const { usuario } = State.get();
    const boton = document.getElementById("btn-entrar");
    if (usuario) {
      boton.innerHTML = `<span class="avatar avatar-mini" aria-hidden="true">${esc(iniciales(usuario.nombre))}</span>${esc(primerNombre(usuario.nombre))}`;
      boton.setAttribute("href", "#/expediente");
      boton.classList.add("con-usuario");
    } else {
      boton.textContent = "Entrar";
      boton.setAttribute("href", "#/entrar");
      boton.classList.remove("con-usuario");
    }
    document.body.classList.remove("menu-abierto");
    document.getElementById("btn-menu").setAttribute("aria-expanded", "false");
  }

  function iniciar() {
    window.addEventListener("hashchange", render);

    document.getElementById("btn-menu").addEventListener("click", (e) => {
      const abierto = document.body.classList.toggle("menu-abierto");
      e.currentTarget.setAttribute("aria-expanded", String(abierto));
    });

    document.getElementById("btn-reiniciar").addEventListener("click", () => {
      State.reset();
      Media.detener();
      Views.reiniciarFiltros();
      toast("Demo reiniciada. Todo volvió al estado inicial.");
      ir("/");
    });

    const dlg = document.getElementById("dlg-privacidad");
    document.querySelectorAll("[data-abrir-privacidad]").forEach((b) =>
      b.addEventListener("click", () => (dlg.showModal ? dlg.showModal() : dlg.setAttribute("open", "")))
    );
    dlg.querySelector("[data-cerrar]").addEventListener("click", () => (dlg.close ? dlg.close() : dlg.removeAttribute("open")));

    render();
  }

  return { iniciar, ir };
})();

document.addEventListener("DOMContentLoaded", Router.iniciar);
