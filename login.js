import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// 1. Configuración de Supabase
const supabase = createClient(
  'https://qdrmvjptjjayfxdwniub.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkcm12anB0ampheWZ4ZHduaXViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNjUwODIsImV4cCI6MjA4MDY0MTA4Mn0.3t5qH77EcWaK4SDCtJOLfP-s-Wtm9ZIulbk0YGrfQWc'
)

// 2. Elementos del DOM
const form = document.getElementById('loginForm')
const emailInput = document.getElementById('email')
const passwordInput = document.getElementById('password')
const recordarCheckbox = document.getElementById('recordarCheckbox') // Asegúrate que este ID exista en tu HTML
const errorText = document.getElementById('error')
const btn = document.getElementById('loginBtn')

// 3. Persistencia inicial (Recordarme)
// Al cargar la página, verificamos si hay un email guardado
document.addEventListener('DOMContentLoaded', () => {
  // Redirección si ya está logueado
  if (localStorage.getItem('admin')) {
    window.location.href = 'panel-admin/panel.html'
    return
  }

  const savedEmail = localStorage.getItem('rememberedEmail')
  if (savedEmail) {
    emailInput.value = savedEmail
    recordarCheckbox.checked = true
    passwordInput.focus() // Salta directo al password si el email ya está
  }
})

// 4. Lógica de Login
form.addEventListener('submit', async (e) => {
  e.preventDefault()

  const email = emailInput.value.trim().toLowerCase()
  const password = passwordInput.value.trim()

  // Validación simple
  if (!email || !password) {
    showError('Completa todos los campos')
    return
  }

  // Feedback visual
  toggleLoading(true)

  try {
    const { data, error } = await supabase
      .from('administradores')
      .select('id, email')
      .eq('email', email)
      .eq('password', password) // Nota: En producción, usa hash de contraseñas
      .single()

    if (error || !data) {
      showError('Credenciales incorrectas')
      toggleLoading(false)
      return
    }

    // --- LÓGICA DE RECORDARME ---
    if (recordarCheckbox.checked) {
      localStorage.setItem('rememberedEmail', email)
    } else {
      localStorage.removeItem('rememberedEmail')
    }

    // Guardar sesión del administrador
    localStorage.setItem('admin', JSON.stringify({
      id: data.id,
      email: data.email,
      loginTime: Date.now()
    }))

    window.location.href = 'panel-admin/panel.html'

  } catch (err) {
    showError('Error de conexión con el servidor')
    toggleLoading(false)
  }
})

// Funciones de utilidad para limpiar el código
function showError(msg) {
  errorText.textContent = msg
  // Opcional: vibración o sacudida del panel
  errorText.style.animation = "shake 0.3s"
  setTimeout(() => errorText.style.animation = "", 300)
}

function toggleLoading(isLoading) {
  btn.disabled = isLoading
  btn.textContent = isLoading ? 'INGRESANDO...' : 'INGRESAR'
  btn.style.opacity = isLoading ? '0.7' : '1'
}