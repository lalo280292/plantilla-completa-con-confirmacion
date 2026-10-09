# Plantilla de invitación · v1 (formato general)

Estilo elegante, neutros cálidos con verde olivo y hojas de olivo a los costados.
Hecha solo con **HTML, CSS, JavaScript y GSAP**: no necesita instalar nada.

---

## 📁 Estructura: solo 2 archivos se editan

| Archivo / carpeta | Para qué sirve | ¿Se edita? |
| --- | --- | --- |
| **`index.html`** | Textos, fotos, links, **orden de módulos**, **animación de cada elemento**, **posición de los adornos** y `AJUSTES` (fecha, WhatsApp, formulario, música) | ✅ **Editable 1** |
| **`css/invitacion.css`** | Fuentes, colores, tamaños, **fondo** (color o mosaico), ajustes por módulo | ✅ **Editable 2** |
| `css/base.css` | Diseño fijo de todos los módulos | ❌ |
| `js/animaciones.js` | Todas las animaciones GSAP y el motor que lee `data-anim` | ❌ |
| `js/funciones.js` | Sobre, carrusel, contador, calendario, galería, copiar, WhatsApp, formulario, música | ❌ |
| `generador-links.html` | Crea un link personalizado por invitado | Herramienta |
| `fotos/` | Fotografías | Se reemplazan |
| `iconos/` | Iconos (PNG / WebP) | Se reemplazan |
| `tematica/` | Adornos, divisor, fondo, sobre y sello (PNG / WebP / JPG) | Se reemplazan |
| `musica/` | Canción (opcional) | Se reemplaza |
| `fuentes/`, `librerias/` | Fuentes locales y GSAP | ❌ |

> No se usan SVG: todas las imágenes son **WebP, PNG o JPG**.

---

## 🚀 Hacer una invitación nueva

1. Copia toda la carpeta y cámbiale el nombre (ej. `boda-ana-luis`).
2. Pon fotos, iconos y adornos nuevos en sus carpetas.
3. En **`index.html`**: cambia `AJUSTES` (arriba), los textos, fotos y links de cada módulo.
4. En **`css/invitacion.css`**: colores, fuentes, tamaños y fondo.
5. Abre `index.html` en el navegador para revisar (mejor con un servidor local, ver abajo).

---

## 🔀 Módulos (en `index.html`)

Cada módulo es un `<section class="modulo" id="...">`.

- **El orden en el archivo es el orden en pantalla.** Para mover uno, corta y pega todo su `<section>`.
- **Para quitar un módulo**, bórralo completo. Para quitar un texto o botón, borra su línea.
- Para agregar otro padrino, foto de galería, hotel, evento del itinerario… copia un bloque y cámbialo.
- Si quitas el formulario, el botón «Ir al formulario» se oculta solo.
- El **sobre** es el `<div id="sobre">` del inicio: bórralo para entrar directo a la invitación.

| id | Módulo | Clases principales |
| --- | --- | --- |
| `sobre` | Pantalla de entrada | `.sobre__titulo` `.sobre__sello` `.sobre__iniciales` |
| `portada` | 1 a N fotos que cambian solas | `.portada__fotos` (pon ahí los `<img>`) `.portada__nombres` `.portada__fecha` |
| `frase` | Frase o cita | `.frase__texto` |
| `novios` | Fotos y mensajes de los novios | `.novio-tarjeta` `.nombre-novio` `.mensaje` `.novios__y` |
| `parallax1`, `parallax2` | Foto grande con movimiento | `.parallax__img` `.parallax__texto` |
| `padres`, `padrinos` | Fotos redondas con nombres | `.persona` `.persona__nombres` (`personas--padrinos` = más chicos) |
| `fecha` | Fecha grande + contador + calendario | `.fecha-grande` `.contador` |
| `misa`, `recepcion` | Lugar con foto, hora, dirección y mapa | `.lugar` `.lugar__foto` `.lugar__nombre` |
| `itinerario` | Línea de tiempo animada | `.itinerario__item` |
| `album` | Foto polaroid + hashtag + botón | `.album__polaroid` `.hashtag` |
| `galeria` | Cuadrícula con visor a pantalla completa | `.galeria__item` |
| `vestimenta` | Código de vestimenta + paleta | `.vestimenta__opcion` `.paleta__color` |
| `regalos` | Tarjetas de regalo / datos bancarios | `.tarjeta` `.datos-banco` `.copiar` |
| `hospedaje` | Tarjetas de hoteles | `.tarjeta` `.hotel__dato` |
| `invitados` | Pase con nombre y número de pases | `.pase__nombre` `.pase__pases` |
| `confirmar` | Botones de confirmación | `[data-confirmar-whatsapp]` |
| `formulario` | Formulario de asistencia | `.formulario` `.campo` |
| `final` | Foto final a pantalla completa | `.final__titulo` |
| `pie` | Crédito de tu marca | `.pie` |

Puedes repetir un tipo de módulo (ej. dos `parallax` o dos `lugar`) siempre que cada `<section>` tenga un `id` distinto.

---

## ✨ Animaciones (en `index.html`)

```html
<section class="modulo" id="novios" data-animacion="subir">   <!-- animación por defecto del módulo -->
  <h2 class="titulo" data-anim>Los novios</h2>                  <!-- usa la del módulo -->
  <p data-anim="letras">Sofía</p>                               <!-- animación propia -->
  <p data-anim="zoom" data-retraso="0.5" data-duracion="2">…</p> <!-- medio segundo después, dura 2 s -->
  <img class="adorno" data-anim="izquierda balanceo" …>         <!-- dos a la vez: entra y luego se mece -->
  <div class="personas" data-escalonar>                         <!-- los hijos salen uno tras otro -->
    <article class="persona" data-anim>…</article>
  </div>
</section>
```

- Un elemento **sin** `data-anim` no se anima.
- Nombres disponibles: `aparecer` `subir` `bajar` `izquierda` `derecha` `zoom` `zoom-suave`
  `desenfoque` `letras` `palabras` `escribir` `rebote` `girar` `voltear` `cortina` `circulo`
  `linea` `caer` `acordeon` `hoja-izquierda` `hoja-derecha` · en bucle: `flotar` `latido`
  `balanceo` `parpadeo` · `ninguna`.
- Efectos automáticos: apertura del sobre, carrusel con acercamiento lento de la portada,
  parallax (`data-parallax`), itinerario que se dibuja (`data-itinerario`), contador y visor.
- Ajustes generales (duración, intensidad del parallax, repetir…) en `CONFIG_ANIMACIONES`
  al inicio de `js/animaciones.js`. Ahí también se registran animaciones nuevas.

---

## 🌿 Adornos con posición exacta (en `index.html`)

Cualquier PNG/WebP decorativo se pone dentro de su `<section>`:

```html
<img class="adorno" src="tematica/flor.png" alt=""
     style="--x:10%; --y:20%; --ancho:30%; --giro:-15deg" data-anim="zoom">
```

| Variable | Qué hace | Ejemplo |
| --- | --- | --- |
| `--x` / `--y` | Distancia desde la **izquierda** / **arriba** del módulo | `--x:10%; --y:20%` |
| `--derecha` / `--abajo` | En lugar de `--x` / `--y`, desde la derecha / abajo | `--derecha:-7%` |
| `--ancho` | Ancho (si no se pone, usa `--adorno-ancho` de `invitacion.css`) | `--ancho:30%` · `--ancho:180px` |
| `--giro` | Rotación | `--giro:-15deg` |
| `--opacidad` | Transparencia | `--opacidad:.6` |
| `--capa` | `1` = detrás del texto (normal) · `3` = delante | `--capa:3` |
| clase `adorno--espejo` | Voltea la imagen horizontalmente | `class="adorno adorno--espejo"` |

Valores negativos sacan el adorno por el borde (se recorta con el módulo).
Los adornos se animan cuando aparece **su módulo** en pantalla.

---

## 🎨 Fondo (en `css/invitacion.css`)

Solo dos opciones:

```css
/* A) Color liso */
--fondo-color:  #f7f3ec;
--fondo-imagen: none;

/* B) Imagen en mosaico (se repite). Si es transparente se ve el color debajo */
--fondo-imagen: url("../tematica/mi-patron.png");
--fondo-tamano: 200px;   /* tamaño de cada pieza; auto = tamaño real */
```

En `:root` aplica a toda la invitación; con `#id-del-modulo { ... }` solo a ese módulo
(la plantilla así alterna el color lino en algunos módulos).

---

## 🤖 Guía para generar invitaciones con IA a partir de un boceto

El boceto indica: **cantidad de módulos**, **orden de los módulos** y **detalles artísticos (PNG) con posición exacta**.
La IA solo modifica **`index.html`** y **`css/invitacion.css`**:

1. **Módulos y orden** → dejar en `index.html` solo los `<section>` del boceto, en ese orden
   (copiándolos de esta plantilla; no inventar clases nuevas, usar las de la tabla de módulos).
2. **Textos, fotos y links** → escribirlos directo en el HTML y en `AJUSTES`.
3. **Adornos** → un `<img class="adorno">` por cada detalle, dentro de su módulo, con `--x`,
   `--y` y `--ancho` en **% del módulo** medidos sobre el boceto, y `--giro` si está rotado.
4. **Animaciones** → `data-animacion` en cada `<section>` y `data-anim` en cada elemento.
5. **Estilo** → en `css/invitacion.css`: colores, fuentes, fondo y ajustes por `#id`.
6. **Nunca** editar `css/base.css`, `js/animaciones.js` ni `js/funciones.js`.

---

## 🖼️ Tamaños recomendados de imágenes

| Imagen | Tamaño | Notas |
| --- | --- | --- |
| Portada | 1600–2000 px de ancho | Encuadre con `--portada-foto-posicion` |
| Novios, padres, padrinos | 500 × 500 px | Cuadradas; el círculo lo hace el diseño |
| Parallax y final | 1600–2000 px de ancho | |
| Misa / recepción | 900 × 675 px | |
| Galería | 1200 px de ancho | Misma foto para miniatura y pantalla completa |
| Iconos | 192 × 192 px PNG transparente | Se ven en un círculo de color |
| Adornos | 2–3 veces el tamaño en pantalla, PNG/WebP transparente | Ej. hoja de 220 px → 660 px |
| Mosaico de fondo | 200–400 px, que empate en los bordes | |

Usa JPG o WebP comprimidos (menos de 300 KB) para que cargue rápido.
Las fotos actuales son **de muestra**: reemplázalas antes de entregar.

---

## 👥 Links personalizados por invitado

```
https://tusitio.com/boda-ana-luis/?invitado=Familia%20López&pases=4
```

El nombre aparece en el sobre, en el «Pase de entrada» y en el formulario, que además limita
los asistentes a sus pases. Si el link no trae datos se usa `AJUSTES.invitado`.
Abre **`generador-links.html`**, pega tu lista (`Nombre, pases`) y obtendrás todos los links
para copiar, enviar por WhatsApp o descargar en Excel.

> El link solo personaliza lo que se ve; no es un sistema de seguridad.

---

## ✅ Confirmaciones (formulario)

En `index.html → AJUSTES.formulario`:

- `enviarA: "whatsapp"` → abre WhatsApp con la respuesta lista para `AJUSTES.whatsapp`.
- `enviarA: "prueba"` → solo muestra el mensaje de gracias.
- `googleSheets: "URL"` (opcional) → además guarda cada respuesta en una hoja de Google.

**Google Sheets:** crea una hoja → *Extensiones → Apps Script* → pega:

```js
function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  SpreadsheetApp.getActiveSheet().appendRow([
    new Date(), d.invitacion, d.nombre, d.asistencia, d.personas, d.telefono, d.mensaje
  ]);
  return ContentService.createTextOutput("ok");
}
```

*Implementar → Nueva implementación → Aplicación web → Acceso: Cualquier usuario*, y pega la URL en `googleSheets`.

---

## 🎵 Música

Pon tu `cancion.mp3` en `musica/` y escribe `musica: { archivo: "musica/cancion.mp3", volumen: 0.5 }`
en `AJUSTES`. El botón aparece solo y la canción empieza al abrir el sobre.

---

## 👀 Revisar en tu computadora

Algunos navegadores no cargan bien todo con doble clic. Desde la carpeta de la invitación:

```bash
python3 -m http.server 8000
```

y abre `http://localhost:8000`.

---

## 🌐 Publicar

Funciona en cualquier hosting estático: **Netlify Drop**, **GitHub Pages**, **Vercel** o tu hosting.
Después de publicar, cambia `og:image` en `index.html` por la URL completa de la foto.

---

## Créditos

- GSAP 3.13 + ScrollTrigger (licencia en `librerias/`).
- Fuentes: Pinyon Script, Italianno, Cormorant Garamond y Manrope (licencia SIL Open Font).
- Fotos de muestra derivadas de las de `Plantillav2` (Unsplash). Sustitúyelas por las del cliente.
