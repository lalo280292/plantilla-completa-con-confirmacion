// admin.js — Utilidades compartidas por panel, confirmados y escaner.

const API_URL = 'api.php';
const CLAVE_STORAGE = 'invitaciones_clave_admin';

// Estilo del estado "¡Copiado!" para todos los botones de copiar
document.head.insertAdjacentHTML('beforeend',
    '<style>.copiado{background:#dcfce7!important;color:#15803d!important;border-color:#86efac!important}</style>');

// Link del pase con QR de una confirmación (paseqr.html está en la misma carpeta)
function linkPase(id) {
    return new URL('paseqr.html?id=' + encodeURIComponent(id), location.href).href;
}

function leerStorage(clave) {
    try { return localStorage.getItem(clave) || ''; } catch (e) { return ''; }
}

function guardarStorage(clave, valor) {
    try {
        if (valor) localStorage.setItem(clave, valor);
        else localStorage.removeItem(clave);
    } catch (e) { /* modo privado: no pasa nada */ }
}

/**
 * Llama a api.php. Si el servidor pide clave (401) la solicita una vez y la recuerda.
 *   apiAdmin('confirmados')
 *   apiAdmin('borrar_confirmacion', { id: 'XXXXX' })   -> POST con JSON
 */
async function apiAdmin(accion, datos = null) {
    for (let intento = 0; intento < 3; intento++) {
        const headers = {};
        const clave = leerStorage(CLAVE_STORAGE);
        if (clave) headers['X-Clave'] = encodeURIComponent(clave);

        const opciones = { method: datos ? 'POST' : 'GET', headers, cache: 'no-store' };
        if (datos) {
            headers['Content-Type'] = 'application/json';
            opciones.body = JSON.stringify(datos);
        }

        const res = await fetch(`${API_URL}?accion=${encodeURIComponent(accion)}&t=${Date.now()}`, opciones);

        if (res.status === 401) {
            guardarStorage(CLAVE_STORAGE, '');
            const nueva = prompt(intento === 0 && !clave
                ? 'Escribe la clave de administración:'
                : 'Clave incorrecta. Escríbela de nuevo:');
            if (!nueva) throw new Error('Se necesita la clave de administración.');
            guardarStorage(CLAVE_STORAGE, nueva.trim());
            continue;
        }

        let json;
        try { json = await res.json(); }
        catch (e) { throw new Error(`El servidor respondió algo inesperado (${res.status}). ¿Está activo PHP?`); }

        if (!res.ok || json.ok === false) throw new Error(json.error || `Error ${res.status}`);
        return json;
    }
    throw new Error('Clave de administración incorrecta.');
}

// Escapa texto antes de meterlo en innerHTML (los nombres y mensajes los escriben los invitados)
function esc(valor) {
    return String(valor ?? '').replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}

function num(valor) {
    return parseInt(valor, 10) || 0;
}

// Copia al portapapeles; funciona también sin HTTPS (método antiguo de respaldo)
async function copiarTexto(texto) {
    if (navigator.clipboard && window.isSecureContext) {
        try { await navigator.clipboard.writeText(texto); return; } catch (e) { /* usa el respaldo */ }
    }
    const area = document.createElement('textarea');
    area.value = texto;
    area.setAttribute('readonly', '');
    area.style.cssText = 'position:fixed;top:-1000px;opacity:0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    if (!ok) throw new Error('No se pudo copiar');
}

// Cambia un botón a "¡Copiado!" por 2 segundos
async function copiarConAviso(btn, texto) {
    try {
        await copiarTexto(texto);
        if (!btn.dataset.html) btn.dataset.html = btn.innerHTML;
        btn.innerHTML = '<i class="ph ph-check-circle"></i> ¡Copiado!';
        btn.classList.add('copiado');
        clearTimeout(btn._t);
        btn._t = setTimeout(() => {
            btn.innerHTML = btn.dataset.html;
            btn.classList.remove('copiado');
        }, 2000);
    } catch (e) {
        prompt('No se pudo copiar automáticamente. Copia el link:', texto);
    }
}

// Fechas de api.php ("2026-10-06 14:30:00") -> "6 oct 2026, 14:30"
function aFecha(valor) {
    const d = new Date(String(valor || '').replace(' ', 'T'));
    return isNaN(d) ? null : d;
}

function fechaLarga(valor, conAnio = false) {
    const d = aFecha(valor);
    const opciones = { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' };
    if (conAnio) opciones.year = 'numeric';
    return d ? d.toLocaleString('es-MX', opciones) : String(valor || '');
}
