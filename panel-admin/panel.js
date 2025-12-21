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

const tbody = document.querySelector('#tabla-reportes tbody')
const errorText = document.getElementById('error')
const logoutBtn = document.getElementById('logoutBtn')

let realtimeChannel = null

// ------------------------
// Logout
// ------------------------
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('admin');
    window.location.href = '../index.html';
});


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

  tbody.innerHTML = ''

  data.forEach(r => {
    const fecha = r.created_at
      ? new Date(r.created_at).toLocaleString()
      : '-'

    const tr = document.createElement('tr')

    // Adaptación para que los enlaces parezcan botones del mockup
    tr.innerHTML = `
      <td>${r.id}</td>
      <td>${r.user_email ?? '-'}</td>
      <td>${r.descripcion ?? '-'}</td>
      <td>${fecha}</td>
      <td>
        ${r.foto_url
          ? `<button class="btn-tabla" onclick="window.open('${r.foto_url}', '_blank')">VER FOTO</button>`
          : '-'}
      </td>
      <td>
        ${r.maps_url
          ? `<button class="btn-tabla" onclick="window.open('${r.maps_url}', '_blank')">VER MAPA</button>`
          : '-'}
      </td>
    `

    tbody.appendChild(tr)
  })
}

// ------------------------
// Realtime listener
// ------------------------
function escucharCambiosRealtime() {
  realtimeChannel = supabase
    .channel('realtime-reportes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'reportes'
      },
      payload => {
        cargarReportes()
      }
    )
    .subscribe()
}

// ------------------------
// Inicializar
// ------------------------
cargarReportes()
escucharCambiosRealtime()