<?php
// api.php — Backend único del sistema de confirmación.
//
// La invitación usa UN SOLO LINK para todos: no hay códigos ni nombres de invitados precargados.
// Cada vez que alguien envía el formulario se guarda una respuesta nueva con su propio
// código de 5 caracteres (ej. KZ83C), que es el que lleva su pase con QR.
//
// Base de datos (carpeta data/):
//   confirmados.json -> respuestas del formulario (código, nombre, asistencia, personas, nombres y felicitación)
//   formulario.txt   -> "false" cuando el formulario está cerrado
//
// Acciones públicas (las usan los invitados):
//   GET  api.php?accion=formulario             ¿el formulario está abierto?
//   POST api.php?accion=confirmar              {"nombre","asistira":"Si|No","cantidad":1..MAX_PERSONAS,"nombres","mensaje"}
//   GET  api.php?accion=confirmacion&id=XXXXX  datos de una respuesta (pase QR y escáner)
//   GET  api.php?accion=firmas                 felicitaciones (libro de firmas)
//
// Acciones de administración (si en config.php se pone una clave, la piden en el encabezado X-Clave):
//   GET  api.php?accion=confirmados            todas las respuestas + resumen
//   GET  api.php?accion=version                huella de los datos (muy ligera) para actualizar en vivo
//   POST api.php?accion=formulario             {"visible":true}  abre o cierra el formulario
//   POST api.php?accion=borrar_confirmacion    {"id":"XXXXX"}  borra una respuesta (ej. duplicada)
//   POST api.php?accion=editar_confirmacion    {"id","nombre","asistira","cantidad","nombres","mensaje"}  corrige una respuesta
//   GET  api.php?accion=respaldo               descarga todas las respuestas

require __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate');
header('X-Content-Type-Options: nosniff');

const ALFABETO_ID = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sin 0/O ni 1/I para evitar confusiones

// ---------- Respuestas ----------

function responder($datos, $codigo = 200)
{
    http_response_code($codigo);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function fallar($mensaje, $codigo = 400)
{
    responder(['ok' => false, 'error' => $mensaje], $codigo);
}

// ---------- Limpieza de datos ----------

function texto($valor, $max)
{
    if (!is_scalar($valor)) return '';
    // Quita caracteres de control (conserva saltos de línea). Si el texto no es UTF-8 válido, preg devuelve null.
    $valor = preg_replace('/[\x00-\x09\x0B-\x1F\x7F]/u', '', trim((string) $valor));
    if ($valor === null) return '';
    if (preg_match('/^.{0,' . (int) $max . '}/su', $valor, $m)) $valor = $m[0];
    return trim($valor);
}

function entero($valor, $min, $max)
{
    $n = is_numeric($valor) ? (int) $valor : 0;
    return max($min, min($max, $n));
}

function normalizar_id($valor)
{
    $id = strtoupper(texto($valor, 20));
    return preg_match('/^[A-Z0-9]{1,20}$/', $id) ? $id : '';
}

// ---------- Almacenamiento JSON ----------

// Explica por qué no se pudo escribir en data/ y cómo arreglarlo en el hosting
function fallar_carpeta($que)
{
    $detalle = error_get_last()['message'] ?? '';
    fallar("$que. Solución: en el administrador de archivos de tu hosting crea la carpeta \"data\" "
        . "junto a api.php (si no existe) y dale permisos 755; si sigue fallando, 775 o 777. "
        . 'Ruta: ' . DATA_DIR . ($detalle !== '' ? " · Detalle: $detalle" : ''), 500);
}

function preparar_carpeta()
{
    if (!is_dir(DATA_DIR) && !@mkdir(DATA_DIR, 0755, true)) fallar_carpeta('No se pudo crear la carpeta data/');
    // Nadie puede descargar los JSON directamente desde el navegador
    $htaccess = DATA_DIR . '/.htaccess';
    if (!is_file($htaccess)) @file_put_contents($htaccess, "Require all denied\nDeny from all\n");
}

function leer_json($archivo, $nombre)
{
    if (!is_file($archivo) || filesize($archivo) === 0) return [];
    // (se quita el BOM por si el archivo se editó y guardó con el Bloc de notas)
    $datos = json_decode(preg_replace('/^\xEF\xBB\xBF/', '', file_get_contents($archivo)), true);
    // Si el archivo está dañado no lo sobrescribimos: se perderían los datos.
    if (!is_array($datos)) fallar("El archivo $nombre.json está dañado. Revísalo o restaura un respaldo.", 500);
    return $datos;
}

/**
 * Abre una base JSON. Si $modificar se indica, se toma un candado exclusivo, la función recibe
 * el arreglo por referencia, puede cambiarlo y lo que devuelva se regresa al llamador.
 * La escritura es atómica (archivo temporal + rename) para que nunca quede un JSON a medias.
 * Solo leer no necesita permisos de escritura (si aún no hay datos, devuelve una lista vacía).
 */
function con_base($nombre, $modificar = null)
{
    $archivo = DATA_DIR . "/$nombre.json";
    if (!$modificar) return leer_json($archivo, $nombre);

    preparar_carpeta();
    $candado = @fopen(DATA_DIR . "/$nombre.lock", 'c');
    if (!$candado) fallar_carpeta('La carpeta data/ no tiene permisos de escritura');
    flock($candado, LOCK_EX);

    $datos = leer_json($archivo, $nombre);
    $resultado = $modificar($datos);
    $json = json_encode(array_values($datos), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $temporal = $archivo . '.tmp';
    if ($json === false || @file_put_contents($temporal, $json) === false || !@rename($temporal, $archivo)) {
        fallar_carpeta("No se pudo guardar $nombre.json");
    }

    flock($candado, LOCK_UN);
    fclose($candado);
    return $resultado;
}

function leer($nombre)
{
    return con_base($nombre);
}

function indice(array $lista, $id)
{
    foreach ($lista as $i => $fila) {
        if (isset($fila['id']) && strtoupper($fila['id']) === $id) return $i;
    }
    return -1;
}

// Código de 5 caracteres con al menos una letra y un número (ej. KZ83C)
function generar_id(array $lista)
{
    $usados = array_flip(array_column($lista, 'id'));
    do {
        $id = '';
        for ($i = 0; $i < 5; $i++) $id .= ALFABETO_ID[random_int(0, strlen(ALFABETO_ID) - 1)];
    } while (isset($usados[$id]) || !preg_match('/[A-Z]/', $id) || !preg_match('/[0-9]/', $id));
    return $id;
}

// Lo que se muestra en el pase y en el escáner (sin la felicitación)
function publica(array $c)
{
    return [
        'id' => $c['id'],
        'nombre' => $c['nombre'] ?? '',
        'asistira' => $c['asistira'] ?? '',
        'cantidad' => (int) ($c['cantidad'] ?? 0),
        'nombres' => $c['nombres'] ?? '',
        'fecha' => $c['fecha'] ?? '',
    ];
}

// Totales para el panel
function resumen(array $confirmados)
{
    $r = ['respuestas' => count($confirmados), 'si' => 0, 'no' => 0, 'personas' => 0, 'mensajes' => 0];
    foreach ($confirmados as $c) {
        if (($c['asistira'] ?? '') === 'Si') {
            $r['si']++;
            $r['personas'] += (int) ($c['cantidad'] ?? 0);
        } else {
            $r['no']++;
        }
        if (trim((string) ($c['mensaje'] ?? '')) !== '') $r['mensajes']++;
    }
    return $r;
}

// Huella de los archivos de datos: cambia cada vez que alguien confirma o se edita algo.
// No interpreta los JSON: solo su fecha y un checksum rápido (crc32), así que es muy ligera.
function version_datos()
{
    clearstatcache();
    $partes = [];
    foreach (['confirmados.json', 'formulario.txt'] as $archivo) {
        $ruta = DATA_DIR . '/' . $archivo;
        $partes[] = is_file($ruta) ? filemtime($ruta) . '-' . hash_file('crc32b', $ruta) : '0';
    }
    return implode('.', $partes);
}

// ---------- Estado del formulario ----------

function formulario_visible()
{
    // Abierto desde el inicio; solo se cierra si en el panel se elige "Cerrar formulario"
    $archivo = DATA_DIR . '/formulario.txt';
    return !is_file($archivo) || trim(file_get_contents($archivo)) !== 'false';
}

// ---------- Utilidades ----------

function requiere_admin()
{
    if (ADMIN_CLAVE === '') return;
    $clave = rawurldecode($_SERVER['HTTP_X_CLAVE'] ?? '');
    if (!hash_equals(ADMIN_CLAVE, $clave)) {
        sleep(1); // frena intentos repetidos
        fallar('Clave de administración incorrecta.', 401);
    }
}

function requiere_post()
{
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') fallar('Método no permitido.', 405);
}

// ---------- Entrada ----------

$accion = $_GET['accion'] ?? ($_POST['accion'] ?? '');
$entrada = $_POST;
if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== false) {
    $entrada = json_decode(file_get_contents('php://input'), true);
    if (!is_array($entrada)) $entrada = [];
}

switch ($accion) {

    // ===== PÚBLICAS =====

    case 'formulario':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            requiere_admin();
            $visible = filter_var($entrada['visible'] ?? false, FILTER_VALIDATE_BOOLEAN);
            preparar_carpeta();
            if (@file_put_contents(DATA_DIR . '/formulario.txt', $visible ? 'true' : 'false') === false) {
                fallar_carpeta('No se pudo guardar el estado del formulario');
            }
            responder([
                'ok' => true,
                'formVisible' => $visible,
                'mensaje' => $visible ? 'Formulario de confirmación ABIERTO' : 'Formulario de confirmación CERRADO',
            ]);
        }
        responder(['ok' => true, 'formVisible' => formulario_visible(), 'maxPersonas' => MAX_PERSONAS]);

    case 'confirmar':
        requiere_post();
        if (!formulario_visible()) fallar('La confirmación de asistencia está cerrada.', 403);

        // Campo trampa: los humanos no lo ven; si viene lleno es un robot y se ignora sin guardar
        if (texto($entrada['sitio'] ?? '', 100) !== '') responder(['ok' => true]);

        $nombre = texto($entrada['nombre'] ?? '', 150);
        if ($nombre === '') fallar('Por favor escribe tu nombre.');

        $asistira = $entrada['asistira'] ?? '';
        if (!in_array($asistira, ['Si', 'No'], true)) fallar('Por favor, indica si asistirás.');

        $cantidad = 0;
        $nombres = '';
        if ($asistira === 'Si') {
            $cantidad = entero($entrada['cantidad'] ?? 0, 0, MAX_PERSONAS);
            if ($cantidad < 1) fallar('Indica cuántas personas asistirán.');
            $nombres = texto($entrada['nombres'] ?? '', 1000);
        }
        $mensaje = texto($entrada['mensaje'] ?? '', 2000);
        $ahora = date('Y-m-d H:i:s');

        $registro = con_base('confirmados', function (array &$lista) use ($nombre, $asistira, $cantidad, $nombres, $mensaje, $ahora) {
            $registro = [
                'id' => generar_id($lista),
                'nombre' => $nombre,
                'asistira' => $asistira,
                'cantidad' => $cantidad,
                'nombres' => $nombres,
                'mensaje' => $mensaje,
                'fecha' => $ahora,
            ];
            $lista[] = $registro;
            return $registro;
        });

        responder(['ok' => true, 'confirmacion' => publica($registro)]);

    case 'confirmacion':
        $id = normalizar_id($_GET['id'] ?? '');
        $confirmados = leer('confirmados');
        $j = indice($confirmados, $id);
        if ($j < 0) fallar('Este código no existe.', 404);
        responder(['ok' => true, 'confirmacion' => publica($confirmados[$j])]);

    case 'firmas':
        $firmas = [];
        foreach (leer('confirmados') as $c) {
            if (trim((string) ($c['mensaje'] ?? '')) === '') continue;
            $firmas[] = ['id' => $c['id'], 'nombre' => $c['nombre'], 'mensaje' => $c['mensaje'], 'fecha' => $c['fecha']];
        }
        usort($firmas, function ($a, $b) { return strcmp($b['fecha'], $a['fecha']); });
        responder(['ok' => true, 'firmas' => $firmas]);

    // ===== ADMINISTRACIÓN =====

    case 'confirmados':
        requiere_admin();
        $confirmados = leer('confirmados');
        responder([
            'ok' => true,
            'confirmados' => $confirmados,
            'resumen' => resumen($confirmados),
            'formVisible' => formulario_visible(),
            'version' => version_datos(),
        ]);

    case 'version':
        requiere_admin();
        responder(['ok' => true, 'version' => version_datos()]);

    case 'borrar_confirmacion':
        requiere_admin();
        requiere_post();
        $id = normalizar_id($entrada['id'] ?? '');
        $borrado = con_base('confirmados', function (array &$lista) use ($id) {
            $j = indice($lista, $id);
            if ($j < 0) return false;
            array_splice($lista, $j, 1);
            return true;
        });
        if (!$borrado) fallar('No existe una respuesta con ese código.', 404);
        responder(['ok' => true, 'id' => $id]);

    case 'editar_confirmacion':
        requiere_admin();
        requiere_post();
        $id = normalizar_id($entrada['id'] ?? '');
        $nombre = texto($entrada['nombre'] ?? '', 150);
        if ($nombre === '') fallar('Escribe el nombre.');
        $asistira = $entrada['asistira'] ?? '';
        if (!in_array($asistira, ['Si', 'No'], true)) fallar('Indica si asistirá o no.');
        // Desde el panel sí se permite pasar del máximo del formulario (por si se autorizó un lugar extra)
        $cantidad = $asistira === 'Si' ? entero($entrada['cantidad'] ?? 0, 0, 999) : 0;
        if ($asistira === 'Si' && $cantidad < 1) fallar('Indica cuántas personas asistirán.');
        $nombres = $asistira === 'Si' ? texto($entrada['nombres'] ?? '', 1000) : '';
        $mensaje = texto($entrada['mensaje'] ?? '', 2000);

        $registro = con_base('confirmados', function (array &$lista) use ($id, $nombre, $asistira, $cantidad, $nombres, $mensaje) {
            $j = indice($lista, $id);
            if ($j < 0) return null;
            $lista[$j] = array_merge($lista[$j], compact('nombre', 'asistira', 'cantidad', 'nombres', 'mensaje'));
            $lista[$j]['actualizado'] = date('Y-m-d H:i:s');
            return $lista[$j];
        });
        if (!$registro) fallar('No existe una respuesta con ese código.', 404);
        responder(['ok' => true, 'confirmacion' => $registro]);

    case 'respaldo':
        requiere_admin();
        header('Content-Disposition: attachment; filename="respaldo-confirmaciones-' . date('Ymd-His') . '.json"');
        responder([
            'ok' => true,
            'generado' => date('Y-m-d H:i:s'),
            'confirmados' => leer('confirmados'),
        ]);

    default:
        fallar('Acción no válida.', 404);
}
