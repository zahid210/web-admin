import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// ------------------------
// SI YA ESTÁ LOGUEADO
// ------------------------
if (localStorage.getItem('admin')) {
  window.location.href = 'panel-admin/panel.html'
}

// ------------------------
// Supabase
// ------------------------
const supabase = createClient(
  'https://qdrmvjptjjayfxdwniub.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkcm12anB0ampheWZ4ZHduaXViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNjUwODIsImV4cCI6MjA4MDY0MTA4Mn0.3t5qH77EcWaK4SDCtJOLfP-s-Wtm9ZIulbk0YGrfQWc'
)

// ------------------------
// DOM
// ------------------------
const form = document.getElementById('loginForm')
const errorText = document.getElementById('error')
const btn = document.getElementById('loginBtn')

// ------------------------
// LOGIN (ENTER + CLICK)
// ------------------------
form.addEventListener('submit', async (e) => {
  e.preventDefault()

  const email = document.getElementById('email').value.trim().toLowerCase()
  const password = document.getElementById('password').value.trim()

  if (!email || !password) {
    errorText.textContent = 'Completa todos los campos'
    return
  }

  errorText.textContent = ''
  btn.disabled = true
  btn.textContent = 'INGRESANDO...'

  const { data, error } = await supabase
    .from('administradores')
    .select('id, email')
    .eq('email', email)
    .eq('password', password)
    .single()

  btn.disabled = false
  btn.textContent = 'INGRESAR'

  if (error || !data) {
    errorText.textContent = 'Credenciales incorrectas'
    return
  }

  localStorage.setItem('admin', JSON.stringify({
    id: data.id,
    email: data.email
  }))

  window.location.href = 'panel-admin/panel.html'
})
