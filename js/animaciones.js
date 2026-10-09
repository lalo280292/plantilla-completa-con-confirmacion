/* =====================================================================
   ✨  ANIMACIONES GSAP  —  NO se edita por invitación
   ---------------------------------------------------------------------
   Las animaciones se ponen en index.html, en cada elemento:

     <section id="novios" class="modulo" data-animacion="subir">  ← animación por defecto del módulo
       <h2 class="titulo" data-anim>…</h2>                         ← usa la del módulo
       <p data-anim="letras">…</p>                                 ← usa una propia
       <p data-anim="subir" data-retraso="0.5">…</p>               ← empieza medio segundo después
       <p data-anim="zoom" data-duracion="2">…</p>                 ← dura 2 segundos
       <img class="adorno" data-anim="izquierda balanceo" …>       ← dos animaciones a la vez
       <div data-escalonar> <article data-anim>… </div>            ← los hijos salen uno tras otro
     </section>

   ┌──────────────┬───────────────────────────────────────────────────┐
   │ NOMBRE       │ QUÉ HACE                                          │
   ├──────────────┼───────────────────────────────────────────────────┤
   │ aparecer     │ aparece suavemente (solo transparencia)           │
   │ subir        │ sube mientras aparece  ← la más elegante          │
   │ bajar        │ baja mientras aparece                             │
   │ izquierda    │ entra desde la izquierda                          │
   │ derecha      │ entra desde la derecha                            │
   │ zoom         │ crece desde pequeño                               │
   │ zoom-suave   │ se acerca muy suave (ideal para fotos y frases)   │
   │ desenfoque   │ pasa de borroso a nítido                          │
   │ letras       │ aparece letra por letra  (para textos cortos)     │
   │ palabras     │ aparece palabra por palabra                       │
   │ escribir     │ efecto máquina de escribir                        │
   │ rebote       │ aparece con un pequeño rebote                     │
   │ girar        │ aparece girando un poco                           │
   │ voltear      │ gira como una tarjeta (3D)                        │
   │ cortina      │ se descubre de arriba hacia abajo (fotos)         │
   │ circulo      │ se descubre en círculo desde el centro (fotos)    │
   │ linea        │ se dibuja desde el centro hacia los lados         │
   │ caer         │ cae desde arriba con rebote                       │
   │ acordeon     │ se estira de arriba hacia abajo                   │
   │ hoja-izquierda │ adorno que entra por la izquierda y se mece     │
   │ hoja-derecha │ adorno que entra por la derecha y se mece         │
   │ flotar       │ flota arriba y abajo sin parar                    │
   │ latido       │ late como corazón sin parar (botones)             │
   │ balanceo     │ se mece suavemente sin parar                      │
   │ parpadeo     │ brilla / se apaga suave sin parar                 │
   │ ninguna      │ sin animación                                     │
   └──────────────┴───────────────────────────────────────────────────┘
   ===================================================================== */


/* ---------- AJUSTES GENERALES ---------- */
const CONFIG_ANIMACIONES = {
  porDefecto:     "subir",      // cuando ni el elemento ni el módulo dicen cuál usar
  duracion:       1.1,          // segundos que dura cada animación
  suavizado:      "power3.out", // tipo de movimiento (power2.out, expo.out, back.out…)
  distancia:      40,           // píxeles que se mueven los elementos al aparecer
  inicio:         "top 88%",    // empieza cuando el elemento llega al 88% de la pantalla
  inicioAdornos:  "top 80%",    // los adornos empiezan cuando su MÓDULO llega al 80%
  repetir:        false,        // true = se repite cada vez que vuelves a pasar por ahí
  escalonado:     0.12,         // retraso entre hijos de un contenedor con data-escalonar
  parallax:       12,           // intensidad del parallax (0 = sin movimiento, 20 = mucho)
  hojasSeMecen:   true,         // "hoja-izquierda" / "hoja-derecha" se mecen sin parar
};


/* =====================================================================
   REGISTRO DE ANIMACIONES
   Cada animación recibe:  el = el elemento,  o = ajustes (duracion,
   suavizado, distancia, retraso). Debe REGRESAR una animación GSAP.

   PARA CREAR UNA NUEVA (al final de esta sección):
     registrarAnimacion("mi-animacion", (el, o) =>
       gsap.from(el, { duration: o.duracion, ease: o.suavizado, autoAlpha: 0, y: -50 }));
   Si se repite sin parar, agrégala también a ANIMACIONES_EN_BUCLE.
   gsap.from = el elemento VIENE desde esos valores · gsap.to = VA hacia ellos
   ===================================================================== */
const ANIMACIONES = {};
function registrarAnimacion(nombre, funcion) { ANIMACIONES[nombre] = funcion; }

// Animaciones que se repiten sin parar (no tienen "estado inicial" oculto)
const ANIMACIONES_EN_BUCLE = ["flotar", "latido", "balanceo", "parpadeo"];

const base = (o) => ({ duration: o.duracion, ease: o.suavizado, delay: o.retraso });

registrarAnimacion("aparecer", (el, o) =>
  gsap.from(el, { ...base(o), autoAlpha: 0, ease: "power1.out" }));

registrarAnimacion("subir", (el, o) =>
  gsap.from(el, { ...base(o), autoAlpha: 0, y: o.distancia }));

registrarAnimacion("bajar", (el, o) =>
  gsap.from(el, { ...base(o), autoAlpha: 0, y: -o.distancia }));

registrarAnimacion("izquierda", (el, o) =>
  gsap.from(el, { ...base(o), autoAlpha: 0, x: -o.distancia * 1.6 }));

registrarAnimacion("derecha", (el, o) =>
  gsap.from(el, { ...base(o), autoAlpha: 0, x: o.distancia * 1.6 }));

registrarAnimacion("zoom", (el, o) =>
  gsap.from(el, { ...base(o), autoAlpha: 0, scale: 0.82 }));

registrarAnimacion("zoom-suave", (el, o) =>
  gsap.from(el, { ...base(o), duration: o.duracion * 1.6, autoAlpha: 0, scale: 1.08, ease: "power2.out" }));

registrarAnimacion("desenfoque", (el, o) =>
  gsap.from(el, { ...base(o), duration: o.duracion * 1.3, autoAlpha: 0, y: 12, filter: "blur(12px)", clearProps: "filter" }));

registrarAnimacion("rebote", (el, o) =>
  gsap.from(el, { ...base(o), autoAlpha: 0, scale: 0.4, ease: "back.out(2.2)" }));

registrarAnimacion("girar", (el, o) =>
  gsap.from(el, { ...base(o), autoAlpha: 0, rotation: -8, y: o.distancia, transformOrigin: "0% 100%" }));

registrarAnimacion("voltear", (el, o) =>
  gsap.from(el, { ...base(o), autoAlpha: 0, rotationY: 90, transformPerspective: 900, ease: "power2.out" }));

registrarAnimacion("cortina", (el, o) =>
  gsap.fromTo(el, { clipPath: "inset(0% 0% 100% 0%)" },
    { ...base(o), duration: o.duracion * 1.4, clipPath: "inset(0% 0% 0% 0%)", ease: "power3.inOut", clearProps: "clipPath" }));

registrarAnimacion("circulo", (el, o) =>
  gsap.fromTo(el, { clipPath: "circle(0% at 50% 50%)" },
    { ...base(o), duration: o.duracion * 1.3, clipPath: "circle(75% at 50% 50%)", ease: "power2.inOut", clearProps: "clipPath" }));

registrarAnimacion("linea", (el, o) =>
  gsap.fromTo(el, { clipPath: "inset(0% 50% 0% 50%)" },
    { ...base(o), duration: o.duracion * 1.4, clipPath: "inset(0% 0% 0% 0%)", ease: "power2.inOut", clearProps: "clipPath" }));

registrarAnimacion("letras", (el, o) => {
  const letras = partirTexto(el, "letras");
  return gsap.from(letras, { ...base(o), autoAlpha: 0, y: "0.45em", rotation: 6, stagger: 0.045, ease: "back.out(1.6)" });
});

registrarAnimacion("palabras", (el, o) => {
  const palabras = partirTexto(el, "palabras");
  return gsap.from(palabras, { ...base(o), autoAlpha: 0, y: "0.6em", filter: "blur(6px)", stagger: 0.08, clearProps: "filter" });
});

registrarAnimacion("escribir", (el, o) => {
  const letras = partirTexto(el, "letras");
  return gsap.from(letras, { delay: o.retraso, autoAlpha: 0, duration: 0.01, stagger: 0.05, ease: "none" });
});

registrarAnimacion("caer", (el, o) =>
  gsap.from(el, { duration: o.duracion, ease: "bounce.out", autoAlpha: 0, y: -120, rotation: -10 }));

registrarAnimacion("acordeon", (el, o) =>
  gsap.from(el, { duration: o.duracion, ease: "elastic.out(1, 0.6)", autoAlpha: 0, scaleY: 0, transformOrigin: "50% 0%" }));

// ---- Adornos laterales: entran desde su lado y se mecen sin parar ----
function animacionHoja(s) {
  return (el) => {
    gsap.set(el, { transformOrigin: s < 0 ? "0% 100%" : "100% 100%" });
    const entrada = gsap.from(el, { x: 80 * s, rotation: 18 * s, autoAlpha: 0, duration: 1.8, ease: "power3.out" });
    if (CONFIG_ANIMACIONES.hojasSeMecen) {
      gsap.to(el, { rotation: -3 * s, duration: 4 + Math.random() * 2, ease: "sine.inOut", yoyo: true, repeat: -1 });
    }
    return entrada;
  };
}
registrarAnimacion("hoja-izquierda", animacionHoja(-1));
registrarAnimacion("hoja-derecha", animacionHoja(1));

// ---- En bucle ----
registrarAnimacion("flotar", (el, o) =>
  gsap.to(el, { y: -8, duration: 1.6, ease: "sine.inOut", yoyo: true, repeat: -1, delay: o.retraso }));

registrarAnimacion("latido", (el, o) =>
  gsap.to(el, { scale: 1.06, duration: 0.55, ease: "sine.inOut", yoyo: true, repeat: -1, repeatDelay: 0.25, delay: o.retraso }));

registrarAnimacion("balanceo", (el, o) =>
  gsap.to(el, { rotation: 2.5, duration: 3.2, ease: "sine.inOut", yoyo: true, repeat: -1, delay: o.retraso }));

registrarAnimacion("parpadeo", (el) =>
  gsap.to(el, { autoAlpha: 0.45, duration: 1.2, ease: "sine.inOut", yoyo: true, repeat: -1 }));

registrarAnimacion("ninguna", () => null);


/* =====================================================================
   EFECTOS ESPECIALES  (los usa js/funciones.js en módulos concretos)
   ===================================================================== */
const EFECTOS = {

  /* ---- Apertura del sobre ---- */
  abrirSobre(p) {
    // p = { sobre, solapa, abajo, sello, textos }
    const tl = gsap.timeline();
    tl.to(p.textos, { autoAlpha: 0, y: 20, duration: 0.4, ease: "power2.in" }, 0)
      .to(p.sello, { scale: 1.15, duration: 0.18, ease: "power1.out" }, 0)
      .to(p.sello, { scale: 0.5, y: "+=90", rotation: -35, autoAlpha: 0, duration: 0.6, ease: "power2.in" }, 0.18)
      .to(p.solapa, { rotationX: 180, duration: 1, ease: "power2.inOut" }, 0.45)
      .set(p.solapa, { zIndex: 1 }, 0.95)                    // a la mitad del giro pasa detrás
      .to(p.abajo, { yPercent: 105, duration: 0.9, ease: "power3.in" }, 1.35)
      .to(p.solapa, { yPercent: -60, autoAlpha: 0, duration: 0.8, ease: "power2.in" }, 1.35)
      .to(p.sobre, { autoAlpha: 0, duration: 0.7, ease: "power1.out" }, 1.75);
    return tl;
  },

  /* ---- Sobre en reposo: aparece y el sello late ---- */
  sobreEnReposo(p) {
    gsap.from([p.sello, p.textos], { autoAlpha: 0, y: 20, duration: 1, stagger: 0.2, ease: "power2.out" });
    return gsap.to(p.sello, { scale: 1.05, duration: 0.9, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 1 });
  },

  /* ---- Entrada de la portada (justo después de abrir el sobre) ---- */
  entradaPortada(portada) {
    const foto = portada.querySelector(".portada__foto");
    if (foto) gsap.from(foto, { scale: 1.25, duration: 2.6, ease: "power2.out" });
  },

  /* ---- Cambio de foto de la portada ---- */
  cambiarFoto(saliente, entrante, segundosTransicion, segundosVisible) {
    gsap.set(entrante, { zIndex: 2 });
    gsap.set(saliente, { zIndex: 1 });
    gsap.fromTo(entrante, { autoAlpha: 0 }, { autoAlpha: 1, duration: segundosTransicion, ease: "power1.inOut",
      onComplete: () => gsap.set(saliente, { autoAlpha: 0 }) });
    // efecto "Ken Burns": la foto se acerca lentamente mientras está visible
    gsap.fromTo(entrante, { scale: 1.12 }, { scale: 1, duration: segundosTransicion + segundosVisible, ease: "none" });
  },

  /* ---- Parallax de fotos grandes ---- */
  parallax(marco) {
    const img = marco.querySelector("img");
    const p = CONFIG_ANIMACIONES.parallax;
    if (!img || !p) return;
    gsap.fromTo(img, { yPercent: -p }, {
      yPercent: p, ease: "none",
      scrollTrigger: { trigger: marco, start: "top bottom", end: "bottom top", scrub: true },
    });
  },

  /* ---- Itinerario: la línea se dibuja con el scroll y cada evento entra ---- */
  itinerario(contenedor) {
    const progreso = contenedor.querySelector(".itinerario__progreso");
    gsap.fromTo(progreso, { scaleY: 0 }, {
      scaleY: 1, ease: "none",
      scrollTrigger: { trigger: contenedor, start: "top 70%", end: "bottom 60%", scrub: 0.6 },
    });
    const escritorio = window.matchMedia("(min-width: 760px)").matches;
    contenedor.querySelectorAll(".itinerario__item").forEach((item, i) => {
      const icono = item.querySelector(".itinerario__icono");
      const tarjeta = item.querySelector(".itinerario__tarjeta");
      const lado = escritorio && i % 2 === 0 ? -1 : 1;
      gsap.timeline({ scrollTrigger: { trigger: item, start: "top 82%", toggleActions: "play none none none" } })
        .from(icono, { scale: 0, rotation: -90, duration: 0.7, ease: "back.out(2)" })
        .from(icono.querySelector("img"), { autoAlpha: 0, scale: 0.4, duration: 0.4 }, 0.35)
        .from(tarjeta, { autoAlpha: 0, x: 50 * lado, duration: 0.8, ease: "power3.out" }, 0.2);
    });
  },

  /* ---- Número del contador cuando cambia ---- */
  cambioContador(el) {
    gsap.fromTo(el, { yPercent: -35, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.45, ease: "power2.out" });
  },

  /* ---- Visor de fotos ---- */
  abrirVisor(visor, img) {
    gsap.fromTo(visor, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35 });
    gsap.fromTo(img, { scale: 0.85, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.5, ease: "power3.out" });
  },
  cerrarVisor(visor, alTerminar) {
    gsap.to(visor, { autoAlpha: 0, duration: 0.3, onComplete: alTerminar });
  },
  cambiarFotoVisor(img, direccion) {
    gsap.fromTo(img, { x: 60 * direccion, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.45, ease: "power2.out" });
  },

  /* ---- Aparición de un bloque oculto (opciones de calendario, gracias del formulario) ---- */
  mostrar(el) {
    gsap.fromTo(el, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" });
  },
};


/* =====================================================================
   MOTOR
   ===================================================================== */

// Divide un texto en letras o palabras para animarlas una por una
function partirTexto(el, modo) {
  if (el.dataset.partido) return [...el.querySelectorAll(modo === "letras" ? ".parte-letra" : ".parte-palabra")];
  el.dataset.partido = "1";
  const recorrer = (nodo) => {
    [...nodo.childNodes].forEach((hijo) => {
      if (hijo.nodeType === 3) {
        const frag = document.createDocumentFragment();
        hijo.textContent.split(/(\s+)/).forEach((trozo) => {
          if (!trozo) return;
          if (/^\s+$/.test(trozo)) { frag.appendChild(document.createTextNode(" ")); return; }
          const palabra = document.createElement("span");
          palabra.className = "parte-palabra";
          [...trozo].forEach((letra) => {
            const s = document.createElement("span");
            s.className = "parte-letra";
            s.textContent = letra;
            palabra.appendChild(s);
          });
          frag.appendChild(palabra);
        });
        hijo.replaceWith(frag);
      } else if (hijo.nodeType === 1 && hijo.tagName !== "BR") {
        recorrer(hijo);
      }
    });
  };
  recorrer(el);
  return [...el.querySelectorAll(modo === "letras" ? ".parte-letra" : ".parte-palabra")];
}

// Aplica una animación con nombre a un elemento, cuando aparece en pantalla
function animarElemento(el, nombre, retraso = 0, duracion = 0) {
  if (typeof gsap === "undefined") return;
  const fn = ANIMACIONES[nombre];
  if (!fn) {
    console.warn(`Animación "${nombre}" no existe. Revisa el nombre en index.html`, el);
    return;
  }
  const C = CONFIG_ANIMACIONES;
  const o = { duracion: (!MOVIMIENTO_REDUCIDO && duracion) || C.duracion, suavizado: C.suavizado, distancia: C.distancia, retraso: 0 };
  const anim = fn(el, o);
  if (!anim) return;
  anim.pause(0);

  // Los adornos se disparan con su módulo (pueden estar muy abajo o fuera de pantalla)
  const esAdorno = el.classList.contains("adorno");
  const disparador = esAdorno ? el.parentElement : el;
  const reproducir = () => (retraso ? gsap.delayedCall(retraso, () => anim.play()) : anim.play());
  ScrollTrigger.create({
    trigger: disparador,
    start: esAdorno ? C.inicioAdornos : C.inicio,
    once: !C.repetir && !ANIMACIONES_EN_BUCLE.includes(nombre),
    onEnter: reproducir,
    onLeaveBack: () => { if (C.repetir) anim.pause(0); },
  });
  // Si ya está visible en la pantalla (ej. al pie de la portada), se anima de una vez
  if (!esAdorno && el.getBoundingClientRect().top < window.innerHeight) reproducir();
}

// Busca todos los [data-anim] de la página y los anima (lo llama js/funciones.js)
function iniciarAnimaciones() {
  if (typeof gsap === "undefined") return;
  const intentar = (que, fn) => { try { fn(); } catch (e) { console.error(`[Animación] ${que}:`, e); } };

  document.querySelectorAll("[data-parallax]").forEach((m) => intentar("parallax", () => EFECTOS.parallax(m)));
  document.querySelectorAll("[data-itinerario]").forEach((it) => intentar("itinerario", () => EFECTOS.itinerario(it)));

  document.querySelectorAll("[data-anim]").forEach((el) => intentar("data-anim", () => {
    if (el.closest("[hidden]")) return;
    const modulo = el.closest("[data-animacion]");
    const nombres = (el.getAttribute("data-anim").trim() ||
      (modulo && modulo.getAttribute("data-animacion")) || CONFIG_ANIMACIONES.porDefecto).split(/\s+/);

    // Dentro de un contenedor con data-escalonar, cada hijo sale un poco después del anterior
    let escalon = 0;
    const padre = el.parentElement;
    if (padre && padre.hasAttribute("data-escalonar")) {
      const hermanos = [...padre.children].filter((h) => h.hasAttribute("data-anim") && !h.hidden);
      escalon = (hermanos.indexOf(el) % 4) * CONFIG_ANIMACIONES.escalonado;
    }
    const retraso = escalon + Number(el.dataset.retraso || 0);
    const duracion = Number(el.dataset.duracion || 0);
    nombres.forEach((nombre) => animarElemento(el, nombre, retraso, duracion));
  }));
  ScrollTrigger.refresh();
}

// Respeta a quien pidió "reducir movimiento" en su teléfono
const MOVIMIENTO_REDUCIDO = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (MOVIMIENTO_REDUCIDO) {
  CONFIG_ANIMACIONES.duracion = 0.01;
  CONFIG_ANIMACIONES.parallax = 0;
  CONFIG_ANIMACIONES.hojasSeMecen = false;
}
