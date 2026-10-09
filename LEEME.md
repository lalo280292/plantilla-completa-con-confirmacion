# Plantilla de invitación · v1 (formato general)

Estilo elegante, neutros cálidos con verde olivo y hojas de olivo a los costados.
Hecha con **HTML, CSS, JavaScript y GSAP**. Las confirmaciones se guardan con **PHP** (`api.php`), sin base de datos.

**Un solo link para todos los invitados**: no lleva nombres ni pases. El formulario está abierto
y cada invitado confirma de **1 a 10 personas en total** con sus nombres; también puede dejar una felicitación.
Cada respuesta recibe su **código de 5 caracteres** (ej. `KZ83C`) y su **pase con QR**.

---

## 📁 Estructura: solo 2 archivos se editan

| Archivo / carpeta | Para qué sirve | ¿Se edita? |
| --- | --- | --- |
| **`index.html`** | Textos, fotos, links, **orden de módulos**, **animación de cada elemento**, **posición de los adornos** y `AJUSTES` (fecha, formulario, música) | ✅ **Editable 1** |
| **`css/invitacion.css`** | Fuentes, colores, tamaños, **fondo** (color o mosaico), ajustes por módulo | ✅ **Editable 2** |
| `css/base.css` | Diseño fijo de todos los módulos | ❌ |
| `js/animaciones.js` | Todas las animaciones GSAP y el motor que lee `data-anim` | ❌ |
| `js/funciones.js` | Sobre, carrusel, contador, calendario, galería, copiar, formulario, música | ❌ |
| `panel.html` | Panel: resumen, abrir/cerrar formulario, PDF y respaldo | Administración |
| `confirmados.html` | Lista en vivo de las respuestas (editar o eliminar respuestas) | Administración |
| `firmas.html` | Libro de felicitaciones, con modo pantalla para proyectar | Administración |
| `paseqr.html` | Pase de acceso con QR del invitado (fondo: `suqr.jpg`) | Se reemplaza `suqr.jpg` |
| `escaner.html` | Lo que se abre al leer el QR: datos de la confirmación (también busca por código) | ❌ |
| `data/` | Aquí se guardan las respuestas. **Súbela al hosting** | ❌ |
| `api.php`, `config.php`, `admin.js` | Backend de las confirmaciones y su configuración | Solo `config.php` |
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
| `formulario` | Confirmación de asistencia (nombre, sí/no, personas, nombres, felicitación) | `.formulario` `.campo` |
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

## ✅ Confirmaciones y felicitaciones

La invitación se comparte con **un solo link** (el de la carpeta, ej. `https://tusitio.com/boda-ana-luis/`).
Cada envío del formulario es una respuesta nueva con: **nombre**, **¿asistirá?**, **número de personas
(1 a 10, en total)**, **nombres de los invitados** y una **felicitación opcional**.
Todo se guarda en `data/confirmados.json` (la carpeta `data/` está protegida con `.htaccess`).

**Código y pase QR:** al confirmar que sí asiste, el invitado ve su código (ej. `KZ83C`) y el botón
«Descargar mi pase con QR» (`paseqr.html?id=KZ83C`). El QR abre `escaner.html?id=KZ83C`, que muestra
en grande el nombre, las personas confirmadas y sus nombres. En la entrada, si un QR no se lee,
abre `escaner.html` y escribe el código.

- `AJUSTES.formulario.maxPersonas` (en `index.html`) y `MAX_PERSONAS` (en `config.php`) = máximo de personas.
- `ADMIN_CLAVE` en `config.php` = clave para el panel (vacía = sin clave).

**Panel (`panel.html`)**

- Resumen en vivo: personas que asistirán, respuestas «Sí», respuestas «No» y felicitaciones.
- **Abrir / cerrar el formulario**: cerrado, la invitación muestra un aviso en lugar del formulario.
- **Confirmaciones** (`confirmados.html`): lista en vivo con código y nombres; copiar el link del pase QR,
  editar una respuesta (nombre, asistencia, personas, nombres o felicitación) o eliminarla.
- **Lectura de Pases** (`escaner.html`): buscar un código a mano.
- **Libro de Felicitaciones** (`firmas.html`): mensajes, con modo pantalla para proyectar en la fiesta.
- PDF de confirmados y respaldo de todas las respuestas.

---

## 🎵 Música

Pon tu `cancion.mp3` en `musica/` y escribe `musica: { archivo: "musica/cancion.mp3", volumen: 0.5 }`
en `AJUSTES`. El botón aparece solo y la canción empieza al abrir el sobre.

---

## 👀 Revisar en tu computadora

Algunos navegadores no cargan bien todo con doble clic. Desde la carpeta de la invitación:

```bash
php -S localhost:8000
```

y abre `http://localhost:8000` (invitación) y `http://localhost:8000/panel.html` (panel).
Con `python3 -m http.server 8000` también se ve la invitación, pero el formulario no guarda.

---

## 🌐 Publicar

Necesita un hosting con **PHP** (cualquier hosting compartido tipo cPanel sirve). Sube toda la carpeta
**incluida `data/`** y comparte su link.

Si al confirmar aparece «No se pudo crear la carpeta data/» o «no tiene permisos de escritura»:
en el administrador de archivos del hosting crea la carpeta `data` junto a `api.php` (si no está)
y cámbiale los permisos a **755**; si sigue igual, **775** o **777**.

**Si usas Cloudflare** (o el hosting guarda caché): los .js y .css se cargan con `?v=3`. Cada vez que
cambies `admin.js`, `js/` o `css/`, sube ese número en los .html (ej. `?v=4`) para que todos reciban la versión nueva.
El panel queda en `https://tusitio.com/boda-ana-luis/panel.html`.
Después de publicar, cambia `og:image` en `index.html` por la URL completa de la foto.

---

## Créditos

- GSAP 3.13 + ScrollTrigger (licencia en `librerias/`).
- Fuentes: Pinyon Script, Italianno, Cormorant Garamond y Manrope (licencia SIL Open Font).
- Fotos de muestra derivadas de las de `Plantillav2` (Unsplash). Sustitúyelas por las del cliente.
