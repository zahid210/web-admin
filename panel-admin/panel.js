import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// ------------------------
// 1. Configuración de Supabase
// ------------------------
const supabaseUrl = 'https://qdrmvjptjjayfxdwniub.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkcm12anB0ampheWZ4ZHduaXViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNjUwODIsImV4cCI6MjA4MDY0MTA4Mn0.3t5qH77EcWaK4SDCtJOLfP-s-Wtm9ZIulbk0YGrfQWc'
const supabase = createClient(supabaseUrl, supabaseKey)

// ------------------------
// 2. Elementos del DOM
// ------------------------
const tbody = document.querySelector('#tabla-reportes tbody')
const errorText = document.getElementById('error')
const logoutBtn = document.getElementById('logoutBtn')
const pagination = document.getElementById('pagination')

// ------------------------
// 3. Estado de la Aplicación
// ------------------------
const filasPorPagina = 10
let paginaActual = 1
let reportes = []
let realtimeChannel = null

// ---------------------------------------------------------
// 4. PROTECCIÓN DE RUTA (Detiene el parpadeo)
// ---------------------------------------------------------
async function chequearAcceso() {
    // Obtenemos la sesión oficial de Supabase
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error || !session) {
        console.log("Sesión no válida o inexistente. Redirigiendo al login...");
        window.location.href = '../index.html'
    } else {
        console.log("Acceso concedido para:", session.user.email);
        // Solo si hay sesión, arrancamos la carga de datos
        inicializarPanel()
    }
}

// ---------------------------------------------------------
// 5. LOGOUT OFICIAL
// ---------------------------------------------------------
logoutBtn.addEventListener('click', async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
        console.error("Error al cerrar sesión:", error.message)
    }
    // Redirigimos siempre al index
    window.location.href = '../index.html'
})

// ------------------------
// 6. Cargar reportes
// ------------------------
async function cargarReportes() {
    const { data, error } = await supabase
        .from('reportes')
        .select('*')
        .order('id', { ascending: false }) // Ver los más recientes primero

    if (error) {
        errorText.textContent = "Error de base de datos: " + error.message
        return
    }

    reportes = data
    renderTabla()
    renderPagination()
}

// ------------------------
// 7. Render tabla con Miniaturas
// ------------------------
function renderTabla() {
    tbody.innerHTML = ''

    const inicio = (paginaActual - 1) * filasPorPagina
    const fin = inicio + filasPorPagina
    const paginaDatos = reportes.slice(inicio, fin)

    paginaDatos.forEach(r => {
        const fecha = r.created_at ? new Date(r.created_at).toLocaleString() : '-'

        const tr = document.createElement('tr')
        tr.innerHTML = `
      <td data-label="ID">${r.id}</td>
      <td data-label="Usuario">${r.user_email ?? '-'}</td>
      <td data-label="Descripción">${r.descripcion ?? '-'}</td>
      <td data-label="Fecha">${fecha}</td>
      <td data-label="Foto">
        ${r.foto_url
                ? `<img src="${r.foto_url}"
                    style="width:60px; height:60px; object-fit:cover; border-radius:8px; cursor:pointer; border: 1px solid #ccc;"
                    title="Click para ampliar"
                    onclick="window.open('${r.foto_url}', '_blank')">`
                : '<span style="color:gray italic">Sin foto</span>'}
      </td>
      <td data-label="Mapa">
        ${r.maps_url
                ? `<button class="btn-map" onclick="window.open('${r.maps_url}', '_blank')">📍 MAPA</button>`
                : '-'}
      </td>
    `
        tbody.appendChild(tr)
    })
}

// ------------------------
// 8. Paginación
// ------------------------
function renderPagination() {
    pagination.innerHTML = ''
    const totalPaginas = Math.ceil(reportes.length / filasPorPagina)
    if (totalPaginas <= 1) return

    // Botón Anterior
    const prev = document.createElement('button')
    prev.textContent = '‹'
    prev.disabled = paginaActual === 1
    prev.onclick = () => cambiarPagina(paginaActual - 1)
    pagination.appendChild(prev)

    // Números de página
    for (let i = 1; i <= totalPaginas; i++) {
        const btn = document.createElement('button')
        btn.textContent = i
        if (i === paginaActual) btn.classList.add('active')
        btn.onclick = () => cambiarPagina(i)
        pagination.appendChild(btn)
    }

    // Botón Siguiente
    const next = document.createElement('button')
    next.textContent = '›'
    next.disabled = paginaActual === totalPaginas
    next.onclick = () => cambiarPagina(paginaActual + 1)
    pagination.appendChild(next)
}

function cambiarPagina(pagina) {
    paginaActual = pagina
    renderTabla()
    renderPagination()
}

// ------------------------
// 9. Realtime
// ------------------------
function escucharCambiosRealtime() {
    if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel)
    }

    realtimeChannel = supabase
        .channel('realtime-reportes')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'reportes' },
            () => cargarReportes()
        )
        .subscribe()
}

// ------------------------
// 10. Inicialización
// ------------------------
function inicializarPanel() {
    cargarReportes()
    escucharCambiosRealtime()
}

// Ejecutar chequeo de seguridad al cargar el script
chequearAcceso()