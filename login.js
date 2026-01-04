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
const recordarCheckbox = document.getElementById('recordarCheckbox')
const errorText = document.getElementById('error')
const btn = document.getElementById('loginBtn')

// 3. Persistencia inicial
document.addEventListener('DOMContentLoaded', async () => {
  // ✅ Verificación de sesión real de Supabase
  const { data: { session } } = await supabase.auth.getSession()

  if (session) {
    window.location.href = 'panel-admin/panel.html'
    return
  }

  const savedEmail = localStorage.getItem('rememberedEmail')
  if (savedEmail) {
    emailInput.value = savedEmail
    recordarCheckbox.checked = true
    passwordInput.focus()
  }
})

// 4. Lógica de Login
form.addEventListener('submit', async (e) => {
  e.preventDefault()

  const email = emailInput.value.trim().toLowerCase()
  const password = passwordInput.value.trim()

  if (!email || !password) {
    showError('Completa todos los campos')
    return
  }

  toggleLoading(true)

  try {
    // ✅ CAMBIO CLAVE: Usamos el metodo oficial de autenticación
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    })

    if (error) {
      showError('Credenciales incorrectas o usuario no autorizado')
      toggleLoading(false)
      return
    }

    // --- LÓGICA DE RECORDARME ---
    if (recordarCheckbox.checked) {
      localStorage.setItem('rememberedEmail', email)
    } else {
      localStorage.removeItem('rememberedEmail')
    }

    // Ya no necesitamos guardar el "admin" en localStorage manualmente,
    // Supabase Auth ya gestiona la sesión en el navegador.
    window.location.href = 'panel-admin/panel.html'

  } catch (err) {
    showError('Error de conexión con el servidor')
    toggleLoading(false)
  }
})

function showError(msg) {
  errorText.textContent = msg
  errorText.style.animation = "shake 0.3s"
  setTimeout(() => errorText.style.animation = "", 300)
}

function toggleLoading(isLoading) {
  btn.disabled = isLoading
  btn.textContent = isLoading ? 'INGRESANDO...' : 'INGRESAR'
}