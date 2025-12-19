import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// 🔐 Credenciales Supabase
const supabaseUrl = 'https://qdrmvjptjjayfxdwniub.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkcm12anB0ampheWZ4ZHduaXViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNjUwODIsImV4cCI6MjA4MDY0MTA4Mn0.3t5qH77EcWaK4SDCtJOLfP-s-Wtm9ZIulbk0YGrfQWc'

const supabase = createClient(supabaseUrl, supabaseKey)

const tbody = document.querySelector('#tabla-reportes tbody')
const errorText = document.getElementById('error')

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

    tr.innerHTML = `
      <td>${r.id}</td>
      <td class="muted">${r.user_email ?? '-'}</td>
      <td>${r.descripcion ?? '-'}</td>
      <td class="muted">${fecha}</td>
      <td>
        ${r.foto_url
          ? `<a href="${r.foto_url}" target="_blank" rel="noopener">
               <img src="${r.foto_url}" />
             </a>`
          : '-'}
      </td>
      <td>
        ${r.maps_url
          ? `<a href="${r.maps_url}" target="_blank">Ver mapa</a>`
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
  supabase
    .channel('realtime-reportes')
    .on(
      'postgres_changes',
      {
        event: '*',           // INSERT | UPDATE | DELETE
        schema: 'public',
        table: 'reportes'
      },
      payload => {
        console.log('🔄 Cambio detectado:', payload.eventType)
        cargarReportes()
      }
    )
    .subscribe(status => {
      console.log('📡 Realtime:', status)
    })
}

// ------------------------
// Inicializar
// ------------------------
cargarReportes()
escucharCambiosRealtime()