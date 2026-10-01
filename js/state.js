/* Vitalia — estado de la demo guardado en localStorage (clave "vitalia_demo").
   Si el navegador bloquea localStorage, se usa una copia en memoria. */

const State = (() => {
  const CLAVE = "vitalia_demo";
  let memoria = null;

  function inicial() {
    return {
      usuario: null,            // { nombre, telefono, correo, departamento }
      citaActual: null,         // { medicoId, fecha (aaaa-mm-dd), hora, motivo }
      pago: null,               // { metodo, monto, referencia }
      pagado: false,
      consultaTerminada: false,
      encuesta: null            // { estrellas, nps }
    };
  }

  function get() {
    if (memoria) return { ...memoria };
    try {
      const guardado = JSON.parse(localStorage.getItem(CLAVE) || "null");
      memoria = { ...inicial(), ...(guardado || {}) };
    } catch (e) {
      memoria = inicial();
    }
    return { ...memoria };
  }

  function set(cambios) {
    memoria = { ...get(), ...cambios };
    try { localStorage.setItem(CLAVE, JSON.stringify(memoria)); } catch (e) { /* solo memoria */ }
    return { ...memoria };
  }

  function reset() {
    memoria = inicial();
    try { localStorage.removeItem(CLAVE); } catch (e) { /* nada */ }
  }

  return { get, set, reset };
})();
