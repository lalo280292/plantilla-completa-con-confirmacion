<?php
// ===== CONFIGURACIÓN DEL EVENTO =====

// Clave para las páginas de administración (panel, confirmados).
// Vacía ('') = sin contraseña. Si algún día quieres protegerlas, escribe una clave aquí
// y se pedirá una sola vez por navegador.
define('ADMIN_CLAVE', '');

// Carpeta donde viven confirmados.json y firmas.json
// (protegida con .htaccess para que nadie pueda descargarlos directamente).
define('DATA_DIR', __DIR__ . '/data');

// Máximo de personas que se pueden confirmar en una sola respuesta del formulario.
define('MAX_PERSONAS', 10);

// Zona horaria para la fecha de las confirmaciones.
date_default_timezone_set('America/Mexico_City');
