/* =====================================================================
   ⚙️  FUNCIONES  —  NO se edita por invitación
   ---------------------------------------------------------------------
   Sobre, carrusel de portada, contador, calendario, galería con visor,
   copiar datos, invitado por link, WhatsApp, formulario y música.
   Lee los textos directamente de index.html y los ajustes de AJUSTES
   (el bloque <script> al inicio de index.html).
   ===================================================================== */

(() => {
  "use strict";

  const A = typeof AJUSTES !== "undefined" ? AJUSTES : {};
  const hayGsap = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
  if (hayGsap) gsap.registerPlugin(ScrollTrigger);

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const raizHtml = document.documentElement;
  const limpiar = (s) => String(s || "").replace(/<br\s*\/?>/gi, ", ").replace(/<[^>]+>/g, "").trim();
  const soloDigitos = (s) => String(s || "").replace(/\D/g, "");

  // Ejecuta un paso sin que un error detenga toda la invitación
  function paso(nombre, fn) {
    try { return fn(); } catch (e) { console.error(`[Invitación] Error en "${nombre}":`, e); }
  }

  /* ---------------------------------------------------------------
     DETALLES GENERALES
     --------------------------------------------------------------- */
  function prepararGeneral() {
    // Los adornos son decorativos: los lectores de pantalla los ignoran
    $$(".adorno").forEach((img) => img.setAttribute("aria-hidden", "true"));
    // Un botón que lleva a un módulo que ya no existe (ej. #formulario) se oculta solo
    $$('a[href^="#"]').forEach((a) => {
      const id = a.getAttribute("href").slice(1);
      if (id && !document.getElementById(id)) a.hidden = true;
    });
  }

  /* ---------------------------------------------------------------
     INVITADO PERSONALIZADO  (?invitado=Familia%20López&pases=4)
     --------------------------------------------------------------- */
  const params = new URLSearchParams(location.search);
  const INV = A.invitado || {};
  const nombreInvitado = (params.get("invitado") || params.get("n") || INV.nombre || "").trim();
  const pasesInvitado = parseInt(params.get("pases") || params.get("p") || INV.pases, 10) || 0;

  function prepararInvitado() {
    $$("[data-invitado-nombre]").forEach((el) => {
      el.textContent = nombreInvitado;          // textContent: el link no puede inyectar HTML
      if (!nombreInvitado) el.hidden = true;
    });
    if (!nombreInvitado) $$(".sobre__para").forEach((el) => (el.hidden = true));
    // Texto con {pases}; si es 1 usa data-uno
    $$("[data-invitado-pases]").forEach((el) => {
      if (!pasesInvitado) { el.hidden = true; return; }
      const plantilla = pasesInvitado === 1 && el.dataset.uno ? el.dataset.uno : el.innerHTML;
      el.innerHTML = plantilla.replace(/\{pases\}/g, pasesInvitado);
    });
  }

  /* ---------------------------------------------------------------
     MÚSICA  (AJUSTES.musica.archivo = "" → sin música)
     --------------------------------------------------------------- */
  const musica = { reproducir() {} };
  function prepararMusica() {
    const M = A.musica || {};
    if (!M.archivo) return;
    const audio = document.createElement("audio");
    audio.loop = true;
    audio.preload = "none";
    audio.src = M.archivo;
    audio.volume = Math.min(1, Math.max(0, M.volumen ?? 0.5));
    const boton = document.createElement("button");
    boton.className = "musica";
    boton.type = "button";
    boton.setAttribute("aria-label", "Música");
    boton.innerHTML = '<img src="iconos/musica.png" alt="">';
    document.body.append(boton, audio);

    const actualizar = () => boton.classList.toggle("sonando", !audio.paused);
    audio.addEventListener("play", actualizar);
    audio.addEventListener("pause", actualizar);
    musica.reproducir = () => audio.play().catch(() => {});
    boton.addEventListener("click", () => (audio.paused ? musica.reproducir() : audio.pause()));
    // Sin sobre, la música empieza con el primer toque en la pantalla
    if (!$("#sobre")) document.addEventListener("pointerdown", musica.reproducir, { once: true });
  }

  /* ---------------------------------------------------------------
     SOBRE
     --------------------------------------------------------------- */
  function prepararSobre(alAbrir) {
    const sobre = $("#sobre");
    if (!sobre) { alAbrir(); return; }
    raizHtml.classList.add("bloqueado");
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    const partes = {
      sobre,
      solapa: $(".sobre__solapa", sobre),
      abajo:  $(".sobre__abajo", sobre),
      sello:  $(".sobre__sello", sobre),
      textos: $(".sobre__textos", sobre),
    };
    const pulso = hayGsap ? EFECTOS.sobreEnReposo(partes) : null;

    let abierto = false;
    function abrir() {
      if (abierto) return;
      abierto = true;
      sobre.removeAttribute("role");
      musica.reproducir();
      const terminar = () => {
        sobre.remove();
        raizHtml.classList.remove("bloqueado");
        if (hayGsap) ScrollTrigger.refresh();
      };
      if (!hayGsap) { terminar(); alAbrir(); return; }
      if (pulso) pulso.kill();
      const tl = EFECTOS.abrirSobre(partes);
      tl.timeScale((A.sobre && A.sobre.velocidad) || 1);
      tl.call(alAbrir, null, Math.max(0, tl.duration() - 0.8));
      tl.eventCallback("onComplete", terminar);
    }
    sobre.addEventListener("click", abrir);
    sobre.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrir(); }
    });
  }

  /* ---------------------------------------------------------------
     PORTADA: fotos que cambian solas
     --------------------------------------------------------------- */
  const portada = { empezar() {} };
  function prepararPortada() {
    const cont = $(".portada__fotos");
    if (!cont) return;
    const P = A.portada || {};
    const cada = Number(P.cadaSegundos) || 5;
    const trans = Number(P.transicionSegundos) || 2;

    const imgs = $$("img", cont);
    imgs.forEach((img, i) => {
      img.classList.add("portada__foto");
      if (i === 0) img.fetchPriority = "high";
    });

    const contPuntos = $(".portada__puntos");
    const puntos = imgs.length > 1 && contPuntos ? imgs.map((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "portada__punto" + (i === 0 ? " activo" : "");
      b.setAttribute("aria-label", `Foto ${i + 1}`);
      b.addEventListener("click", () => ir(i));
      contPuntos.appendChild(b);
      return b;
    }) : [];

    let actual = 0;
    let temporizador = null;
    function ir(n) {
      if (n === actual || !imgs[n]) return;
      const saliente = imgs[actual];
      const entrante = imgs[n];
      if (hayGsap) EFECTOS.cambiarFoto(saliente, entrante, trans, cada);
      else { saliente.style.opacity = 0; entrante.style.opacity = 1; }
      actual = n;
      puntos.forEach((p, i) => p.classList.toggle("activo", i === n));
      programar();
    }
    function programar() {
      clearTimeout(temporizador);
      if (imgs.length < 2) return;
      temporizador = setTimeout(() => {
        if (document.hidden) programar();
        else ir((actual + 1) % imgs.length);
      }, (cada + trans) * 1000);
    }

    // Flecha "ver más": baja al siguiente módulo
    const seccion = cont.closest("section");
    const flecha = $(".portada__bajar");
    if (flecha) flecha.addEventListener("click", (e) => {
      e.preventDefault();
      const siguiente = seccion && seccion.nextElementSibling;
      if (siguiente) siguiente.scrollIntoView({ behavior: "smooth" });
    });

    portada.empezar = () => {
      if (hayGsap && seccion) EFECTOS.entradaPortada(seccion);
      programar();
    };
  }

  /* ---------------------------------------------------------------
     CONTADOR  (usa AJUSTES.evento.fecha)
     --------------------------------------------------------------- */
  function prepararContador() {
    const cont = $("[data-contador]");
    if (!cont || !A.evento) return;
    const meta = new Date(A.evento.fecha).getTime();
    if (isNaN(meta)) { console.warn("Revisa AJUSTES.evento.fecha en index.html (formato AAAA-MM-DDTHH:MM:00)"); return; }
    const final = $("[data-contador-final]");
    const partes = {};
    $$("[data-contador-parte]", cont).forEach((el) => (partes[el.dataset.contadorParte] = el));
    const previo = {};
    let intervalo = null;

    function tick() {
      const dif = meta - Date.now();
      if (dif <= 0) {
        clearInterval(intervalo);
        cont.hidden = true;
        const etiqueta = cont.previousElementSibling;
        if (etiqueta && etiqueta.classList.contains("etiqueta")) etiqueta.hidden = true;
        if (final && final.textContent.trim()) final.hidden = false;
        return;
      }
      const valores = {
        dias:     Math.floor(dif / 864e5),
        horas:    Math.floor(dif / 36e5) % 24,
        minutos:  Math.floor(dif / 6e4) % 60,
        segundos: Math.floor(dif / 1e3) % 60,
      };
      Object.keys(valores).forEach((k) => {
        const t = String(valores[k]).padStart(2, "0");
        if (!partes[k] || previo[k] === t) return;
        partes[k].textContent = t;
        if (previo[k] !== undefined && hayGsap) EFECTOS.cambioContador(partes[k]);
        previo[k] = t;
      });
    }
    tick();
    intervalo = setInterval(tick, 1000);
  }

  /* ---------------------------------------------------------------
     GUARDAR EN CALENDARIO  (Google + archivo .ics para Apple/Outlook)
     --------------------------------------------------------------- */
  function prepararCalendario() {
    const boton = $("[data-calendario-abrir]");
    const opciones = $("[data-calendario-opciones]");
    if (!boton || !opciones || !A.evento) return;
    const E = A.evento;
    const inicio = new Date(E.fecha);
    const fin = E.fechaFin ? new Date(E.fechaFin) : new Date(inicio.getTime() + 6 * 36e5);
    if (isNaN(inicio)) return;
    const utc = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const titulo = limpiar(E.titulo);
    const lugar = limpiar(E.lugar);
    const descripcion = limpiar(E.descripcion) + "\n" + location.href.split("?")[0];

    $("[data-calendario-google]", opciones).href =
      "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      `&text=${encodeURIComponent(titulo)}&dates=${utc(inicio)}/${utc(fin)}` +
      `&details=${encodeURIComponent(descripcion)}&location=${encodeURIComponent(lugar)}`;

    const esc = (s) => s.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Invitacion//ES", "BEGIN:VEVENT",
      `UID:${utc(inicio)}-${Math.random().toString(36).slice(2)}@invitacion`,
      `DTSTAMP:${utc(new Date())}`, `DTSTART:${utc(inicio)}`, `DTEND:${utc(fin)}`,
      `SUMMARY:${esc(titulo)}`, `LOCATION:${esc(lugar)}`, `DESCRIPTION:${esc(descripcion)}`,
      "BEGIN:VALARM", "TRIGGER:-P1D", "ACTION:DISPLAY", `DESCRIPTION:${esc(titulo)}`, "END:VALARM",
      "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");
    const enlaceIcs = $("[data-calendario-ics]", opciones);
    enlaceIcs.href = "data:text/calendar;charset=utf-8," + encodeURIComponent(ics);
    enlaceIcs.download = (titulo || "evento").normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "-") + ".ics";

    boton.addEventListener("click", () => {
      opciones.hidden = !opciones.hidden;
      if (!opciones.hidden && hayGsap) EFECTOS.mostrar(opciones);
    });
  }

  /* ---------------------------------------------------------------
     GALERÍA + VISOR A PANTALLA COMPLETA  (el visor se crea solo)
     --------------------------------------------------------------- */
  function prepararGaleria() {
    const galeria = $("[data-galeria]");
    if (!galeria) return;
    const botones = $$(".galeria__item", galeria);
    const fotos = botones.map((b) => b.querySelector("img").getAttribute("src"));
    if (!fotos.length) return;

    const visor = document.createElement("div");
    visor.className = "visor";
    visor.hidden = true;
    visor.setAttribute("role", "dialog");
    visor.setAttribute("aria-modal", "true");
    visor.setAttribute("aria-label", "Foto en pantalla completa");
    visor.innerHTML = `
      <img class="visor__img" alt="">
      <button class="visor__boton visor__cerrar" type="button" aria-label="Cerrar">×</button>
      <button class="visor__boton visor__anterior" type="button" aria-label="Foto anterior">‹</button>
      <button class="visor__boton visor__siguiente" type="button" aria-label="Foto siguiente">›</button>
      <p class="visor__contador"></p>`;
    document.body.appendChild(visor);

    const img = $(".visor__img", visor);
    const contador = $(".visor__contador", visor);
    const cerrarBtn = $(".visor__cerrar", visor);
    let actual = 0;
    let focoPrevio = null;

    function mostrar(n, direccion) {
      actual = (n + fotos.length) % fotos.length;
      img.src = fotos[actual];
      contador.textContent = `${actual + 1} / ${fotos.length}`;
      if (direccion && hayGsap) EFECTOS.cambiarFotoVisor(img, direccion);
    }
    function abrir(n) {
      focoPrevio = document.activeElement;
      mostrar(n);
      visor.hidden = false;
      raizHtml.classList.add("bloqueado");
      if (hayGsap) EFECTOS.abrirVisor(visor, img);
      cerrarBtn.focus({ preventScroll: true });
    }
    function cerrar() {
      const fin = () => {
        visor.hidden = true;
        raizHtml.classList.remove("bloqueado");
        if (focoPrevio) focoPrevio.focus({ preventScroll: true });
      };
      if (hayGsap) EFECTOS.cerrarVisor(visor, fin); else fin();
    }
    const siguiente = () => mostrar(actual + 1, 1);
    const anterior  = () => mostrar(actual - 1, -1);

    botones.forEach((b, i) => {
      b.setAttribute("aria-label", `Ver foto ${i + 1} de ${fotos.length}`);
      b.addEventListener("click", () => abrir(i));
    });
    cerrarBtn.addEventListener("click", cerrar);
    $(".visor__siguiente", visor).addEventListener("click", siguiente);
    $(".visor__anterior", visor).addEventListener("click", anterior);
    visor.addEventListener("click", (e) => { if (e.target === visor) cerrar(); });
    document.addEventListener("keydown", (e) => {
      if (visor.hidden) return;
      if (e.key === "Escape") cerrar();
      if (e.key === "ArrowRight") siguiente();
      if (e.key === "ArrowLeft") anterior();
    });
    // Deslizar con el dedo
    let inicioX = null;
    visor.addEventListener("pointerdown", (e) => (inicioX = e.clientX));
    visor.addEventListener("pointerup", (e) => {
      if (inicioX === null) return;
      const dx = e.clientX - inicioX;
      inicioX = null;
      if (Math.abs(dx) > 45) (dx < 0 ? siguiente : anterior)();
    });
  }

  /* ---------------------------------------------------------------
     BOTONES "COPIAR"  (data-copiar="texto a copiar")
     --------------------------------------------------------------- */
  function prepararCopiar() {
    document.addEventListener("click", async (e) => {
      const b = e.target.closest("[data-copiar]");
      if (!b) return;
      const valor = limpiar(b.getAttribute("data-copiar")).replace(/\s+/g, "");
      try {
        await navigator.clipboard.writeText(valor);
      } catch {
        const t = document.createElement("textarea");
        t.value = valor;
        t.style.position = "fixed";
        t.style.opacity = "0";
        document.body.appendChild(t);
        t.select();
        document.execCommand("copy");
        t.remove();
      }
      const etiqueta = b.querySelector("span");
      if (!etiqueta) return;
      const original = etiqueta.textContent;
      b.classList.add("copiado");
      etiqueta.textContent = "¡Copiado!";
      setTimeout(() => { b.classList.remove("copiado"); etiqueta.textContent = original; }, 2000);
    });
  }

  /* ---------------------------------------------------------------
     CONFIRMAR POR WHATSAPP (botón directo)
     --------------------------------------------------------------- */
  function prepararConfirmar() {
    $$("[data-confirmar-whatsapp]").forEach((boton) => {
      const numero = soloDigitos(A.whatsapp);
      if (!numero) { boton.hidden = true; return; }
      const mensaje = limpiar(A.mensajeWhatsapp).replace(/\{invitado\}/g, nombreInvitado || "");
      boton.href = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
    });
  }

  /* ---------------------------------------------------------------
     FORMULARIO DE CONFIRMACIÓN
     --------------------------------------------------------------- */
  function prepararFormulario() {
    const form = $("#form-confirmacion");
    if (!form) return;
    const F = A.formulario || {};
    const error = $("[data-form-error]");
    const gracias = $("[data-form-gracias]");
    const campoPersonas = $("[data-campo-personas]", form);
    const selectPersonas = form.elements.personas;
    const valor = (nombre) => (form.elements[nombre] ? form.elements[nombre].value.trim() : "");
    // Usa el texto de cada etiqueta del formulario para el mensaje de WhatsApp
    const etiqueta = (nombre, porDefecto) => {
      const campo = form.elements[nombre];
      const caja = campo && (campo.closest ? campo.closest(".campo") : campo[0].closest(".campo"));
      const t = caja && caja.querySelector(":scope > span, :scope > legend");
      return (t && t.textContent.trim()) || porDefecto;
    };

    if (selectPersonas) {
      const maximo = pasesInvitado || 10;
      for (let i = 1; i <= maximo; i++) selectPersonas.add(new Option(String(i), String(i)));
      selectPersonas.value = String(maximo);
    }
    if (nombreInvitado && form.elements.nombre) form.elements.nombre.value = nombreInvitado;

    form.addEventListener("change", () => {
      if (campoPersonas) campoPersonas.hidden = valor("asistencia") === "no";
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nombre = valor("nombre");
      const campoNombre = form.elements.nombre.closest(".campo");
      if (!nombre) {
        error.textContent = "Por favor escribe tu nombre.";
        error.hidden = false;
        campoNombre.classList.add("con-error");
        form.elements.nombre.focus();
        return;
      }
      error.hidden = true;
      campoNombre.classList.remove("con-error");

      const asiste = valor("asistencia") !== "no";
      const datos = {
        evento:     limpiar(A.evento && A.evento.titulo),
        invitacion: nombreInvitado,
        nombre,
        asistencia: asiste ? "Sí" : "No",
        personas:   asiste && selectPersonas ? selectPersonas.value : "0",
        telefono:   valor("telefono"),
        mensaje:    valor("mensaje"),
        fecha:      new Date().toISOString(),
      };

      // Opcional: guardar en Google Sheets
      if (F.googleSheets) {
        fetch(F.googleSheets, { method: "POST", mode: "no-cors", body: JSON.stringify(datos) }).catch(() => {});
      }

      // WhatsApp
      const numero = soloDigitos(F.whatsapp || A.whatsapp);
      if (F.enviarA === "whatsapp" && numero) {
        const lineas = [
          `*Confirmación · ${datos.evento}*`,
          `${etiqueta("nombre", "Nombre")}: ${datos.nombre}`,
          `${etiqueta("asistencia", "¿Asistirá?")} ${asiste ? "Sí ✅" : "No ❌"}`,
        ];
        if (asiste && selectPersonas) lineas.push(`${etiqueta("personas", "Personas")}: ${datos.personas}`);
        if (datos.telefono) lineas.push(`Teléfono: ${datos.telefono}`);
        if (datos.mensaje) lineas.push(`Mensaje: ${datos.mensaje}`);
        window.open(`https://wa.me/${numero}?text=${encodeURIComponent(lineas.join("\n"))}`, "_blank");
      }

      form.hidden = true;
      if (gracias) {
        gracias.hidden = false;
        if (hayGsap) EFECTOS.mostrar(gracias);
      }
    });
  }

  /* ---------------------------------------------------------------
     ARRANQUE
     --------------------------------------------------------------- */
  paso("general", prepararGeneral);
  paso("invitado", prepararInvitado);
  paso("música", prepararMusica);
  paso("portada", prepararPortada);
  paso("contador", prepararContador);
  paso("calendario", prepararCalendario);
  paso("galería", prepararGaleria);
  paso("copiar", prepararCopiar);
  paso("confirmar", prepararConfirmar);
  paso("formulario", prepararFormulario);

  paso("sobre", () => prepararSobre(() => {
    paso("animaciones", iniciarAnimaciones);
    paso("portada", () => portada.empezar());
  }));

  raizHtml.classList.remove("cargando");
  window.addEventListener("load", () => { if (hayGsap) ScrollTrigger.refresh(); });
})();
