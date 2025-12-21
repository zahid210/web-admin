import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// ------------------------
// PROTECCIÓN LOGIN ADMIN
// ------------------------
const admin = localStorage.getItem('admin')
if (!admin) {
  window.location.href = '../index.html'
}

// ------------------------
// Supabase
// ------------------------
const supabaseUrl = 'https://qdrmvjptjjayfxdwniub.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkcm12anB0ampheWZ4ZHduaXViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNjUwODIsImV4cCI6MjA4MDY0MTA4Mn0.3t5qH77EcWaK4SDCtJOLfP-s-Wtm9ZIulbk0YGrfQWc'
const supabase = createClient(supabaseUrl, supabaseKey)

// ------------------------
// DOM
// ------------------------
const tbody = document.querySelector('#tabla-reportes tbody')
const errorText = document.getElementById('error')
const logoutBtn = document.getElementById('logoutBtn')
const pagination = document.getElementById('pagination')

// ------------------------
// PAGINACIÓN
// ------------------------
const filasPorPagina = 10
let paginaActual = 1
let reportes = []

let realtimeChannel = null

// ------------------------
// Logout
// ------------------------
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('admin')
  window.location.href = '../index.html'
})

// ------------------------
// Cargar reportes
// ------------------------
async function cargarReportes() {
  const { data, error } = await supabase
    .from('reportes')
    .select('*')
    .order('id', { ascending: true })

  if (error) {
    errorText.textContent = error.message
    console.error(error)
    return
  }

  reportes = data
  if (paginaActual > Math.ceil(reportes.length / filasPorPagina)) {
    paginaActual = 1
  }

  renderTabla()
  renderPagination()
}

// ------------------------
// Render tabla (paginada)
// ------------------------
function renderTabla() {
  tbody.innerHTML = ''

  const inicio = (paginaActual - 1) * filasPorPagina
  const fin = inicio + filasPorPagina
  const paginaDatos = reportes.slice(inicio, fin)

  paginaDatos.forEach(r => {
    const fecha = r.created_at
      ? new Date(r.created_at).toLocaleString()
      : '-'

    const tr = document.createElement('tr')
    tr.innerHTML = `
      <td data-label="ID">${r.id}</td>
      <td data-label="Usuario">${r.user_email ?? '-'}</td>
      <td data-label="Descripción">${r.descripcion ?? '-'}</td>
      <td data-label="Fecha">${fecha}</td>
      <td data-label="Foto">
        ${r.foto_url
        ? `<button onclick="window.open('${r.foto_url}', '_blank')">VER FOTO</button>`
        : '-'}
      </td>
      <td data-label="Mapa">
        ${r.maps_url
        ? `<button onclick="window.open('${r.maps_url}', '_blank')">VER MAPA</button>`
        : '-'}
      </td>
    `
    tbody.appendChild(tr)
  })
}

// ------------------------
// Render pagination
// ------------------------
function renderPagination() {
  pagination.innerHTML = ''
  const totalPaginas = Math.ceil(reportes.length / filasPorPagina)
  if (totalPaginas <= 1) return

  const prev = document.createElement('button')
  prev.textContent = '‹'
  prev.disabled = paginaActual === 1
  prev.onclick = () => cambiarPagina(paginaActual - 1)
  pagination.appendChild(prev)

  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement('button')
    btn.textContent = i
    if (i === paginaActual) btn.classList.add('active')
    btn.onclick = () => cambiarPagina(i)
    pagination.appendChild(btn)
  }

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
// Realtime listener
// ------------------------
function escucharCambiosRealtime() {
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
// Inicializar
// ------------------------
cargarReportes()
escucharCambiosRealtime()