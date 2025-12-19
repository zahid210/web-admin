import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(
  'https://qdrmvjptjjayfxdwniub.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkcm12anB0ampheWZ4ZHduaXViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNjUwODIsImV4cCI6MjA4MDY0MTA4Mn0.3t5qH77EcWaK4SDCtJOLfP-s-Wtm9ZIulbk0YGrfQWc'
)

const btn = document.getElementById('loginBtn')
const errorText = document.getElementById('error')

btn.onclick = async () => {
  const email = document.getElementById('email').value.trim()
  const password = document.getElementById('password').value.trim()

  if (!email || !password) {
    errorText.textContent = 'Completa todos los campos'
    return
  }

  const { data, error } = await supabase
    .from('administradores')
    .select('*')
    .eq('email', email)
    .eq('password', password)
    .single()

  if (error || !data) {
    errorText.textContent = 'Credenciales incorrectas'
    return
  }

  // Guardar sesión simple
  localStorage.setItem('admin', JSON.stringify({
    id: data.id,
    email: data.email
  }))

  window.location.href = 'panelAdmin.html'
}
