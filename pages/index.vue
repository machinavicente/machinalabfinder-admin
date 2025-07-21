<template>
  <div class="auth-container">
    <div class="auth-card">
      <!-- Logo UNEFA -->
      <div class="auth-header text-center mb-4">
        <img src="/assets/images/logo.png" alt="UNEFA Logo" class="auth-logo" />
        <h3 class="mt-3 text-unefa">
          <i class="bi bi-shield-lock me-2"></i>Panel Administrativo
        </h3>
        <p class="text-muted">MachinaLab Finder</p>
      </div>

      <!-- Sistema de alertas mejorado -->
      <div class="alert-container">
        <transition-group name="alert">
          <div 
            v-for="(alert, index) in activeAlerts" 
            :key="alert.id"
            class="alert"
            :class="`alert-${alert.type}`"
          >
            <div class="alert-content">
              <i :class="alert.icon"></i>
              <span>{{ alert.message }}</span>
              <button class="alert-close" @click="removeAlert(index)">
                <i class="bi bi-x"></i>
              </button>
            </div>
          </div>
        </transition-group>
      </div>

      <!-- Formulario de inicio de sesión -->
      <form @submit.prevent="handleLogin" class="auth-form">
        <!-- Campo de usuario -->
        <div class="mb-3">
          <label for="username" class="form-label">
            <i class="bi bi-person-fill me-2 text-unefa"></i>Usuario
          </label>
          <div class="input-group">
            <input
              v-model="username"
              type="text"
              class="form-control"
              id="username"
              placeholder="Ingresar Usuario"
              required
              autocomplete="username"
            />
          </div>
        </div>

        <!-- Campo de contraseña con toggle -->
        <div class="mb-4">
          <label for="password" class="form-label">
            <i class="bi bi-lock-fill me-2 text-unefa"></i>Contraseña
          </label>
          <div class="input-group">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="form-control"
              id="password"
              placeholder="**********"
              required
              autocomplete="current-password"
            />
            <button
              class="btn btn-outline-secondary"
              type="button"
              @click="togglePasswordVisibility"
              :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            >
              <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>
        </div>

        <!-- Botón de inicio de sesión -->
        <button type="submit" class="btn btn-unefa w-100 py-2 mb-3" :disabled="loading">
          <span v-if="loading">
            <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Verificando...
          </span>
          <span v-else>
            <i class="bi bi-box-arrow-in-right me-2"></i>Iniciar Sesión
          </span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'

const username = ref('')
const password = ref('')
const loading = ref(false)
const showPassword = ref(false)

// Sistema de alertas mejorado
interface Alert {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  icon: string;
  timeout?: number;
}

const alerts = ref<Alert[]>([])
let alertIdCounter = 0

const activeAlerts = computed(() => alerts.value)

function addAlert(type: Alert['type'], message: string, timeout = 5000) {
  const icons = {
    success: 'bi bi-check-circle-fill',
    error: 'bi bi-exclamation-circle-fill',
    warning: 'bi bi-exclamation-triangle-fill',
    info: 'bi bi-info-circle-fill'
  }
  
  const newAlert: Alert = {
    id: alertIdCounter++,
    type,
    message,
    icon: icons[type],
    timeout
  }
  
  alerts.value.push(newAlert)
  
  if (timeout > 0) {
    setTimeout(() => {
      removeAlertById(newAlert.id)
    }, timeout)
  }
}

function removeAlert(index: number) {
  alerts.value.splice(index, 1)
}

function removeAlertById(id: number) {
  const index = alerts.value.findIndex(alert => alert.id === id)
  if (index !== -1) {
    alerts.value.splice(index, 1)
  }
}

const { login } = useAuth()

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
  // Enfocar de nuevo el input de contraseña para mejor UX
  nextTick(() => {
    const passwordInput = document.getElementById('password')
    if (passwordInput) passwordInput.focus()
  })
}

const handleLogin = async () => {
  if (!username.value || !password.value) {
    addAlert('error', 'Por favor complete todos los campos')
    return
  }

  loading.value = true

  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (login(username.value, password.value)) {
      addAlert('success', 'Inicio de sesión exitoso')
      return navigateTo('/panel')
    } else {
      addAlert('error', 'Credenciales incorrectas')
    }
  } catch (error) {
    addAlert('error', 'Error al iniciar sesión. Por favor, intente nuevamente.')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 1rem;
}

.auth-card {
  width: 100%;
  max-width: 450px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  border-top: 5px solid #003366;
}

.auth-header {
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.auth-logo {
  height: 80px;
  margin-bottom: 1rem;
}

.text-unefa {
  color: #003366;
  font-weight: 600;
}

.btn-unefa {
  background-color: #003366;
  color: white;
  border: none;
  transition: all 0.3s;
}

.btn-unefa:hover {
  background-color: #002147;
  color: #FFCC00;
}

.btn-outline-secondary {
  padding: 10px;
  border-radius: 0 8px 8px 0;
  border-left: none;
}

.form-control {
  border-radius: 8px;
  padding: 10px 15px;
  border: 1px solid #ced4da;
  transition: border-color 0.3s;
}

/* Estilos para el sistema de alertas */
.alert-container {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1100;
  max-width: 450px;
  width: 90%;
}

.alert {
  position: relative;
  padding: 1rem 1.5rem;
  margin-bottom: 0.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  overflow: hidden;
  transition: all 0.3s ease;
  opacity: 1;
  transform: translateY(0);
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
  border-left: 4px solid #28a745;
}

.alert-error {
  background-color: #f8d7da;
  color: #721c24;
  border-left: 4px solid #dc3545;
}

.alert-warning {
  background-color: #fff3cd;
  color: #856404;
  border-left: 4px solid #ffc107;
}

.alert-info {
  background-color: #d1ecf1;
  color: #0c5460;
  border-left: 4px solid #17a2b8;
}

.alert-content {
  display: flex;
  align-items: center;
  width: 100%;
}

.alert i {
  margin-right: 12px;
  font-size: 1.25rem;
}

.alert-close {
  margin-left: auto;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0;
  font-size: 1.2rem;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.alert-close:hover {
  opacity: 1;
}

/* Transiciones para alertas */
.alert-enter-from,
.alert-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

.alert-enter-active,
.alert-leave-active {
  transition: all 0.3s ease;
}

.alert-move {
  transition: transform 0.3s ease;
}

@media (max-width: 576px) {
  .auth-card {
    padding: 1.5rem;
  }
  
  .auth-logo {
    height: 70px;
  }

  .alert-container {
    width: 95%;
  }

  .alert {
    padding: 0.8rem 1rem;
    font-size: 0.9rem;
  }

  .alert i {
    font-size: 1rem;
    margin-right: 8px;
  }
}
</style>