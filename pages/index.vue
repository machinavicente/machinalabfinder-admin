<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Logo UNEFA -->
      <div class="text-center mb-4">
        <img src="public/assets/images/logo.png" alt="UNEFA Logo" height="120px" class="login-logo" />
        <h3 class="mt-3 text-unefa">Panel Administrativo</h3>
        <p class="text-muted">MachinaLab Finder</p>
      </div>

      <!-- Formulario de inicio de sesión -->
      <form @submit.prevent="handleLogin" class="login-form">
        <!-- Mensaje de error -->
        <div v-if="errorMessage" class="alert alert-danger d-flex align-items-center">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Campo de usuario -->
        <div class="mb-3">
          <label for="username" class="form-label">
            <i class="bi bi-person-fill me-2"></i>Usuario
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
            <i class="bi bi-lock-fill me-2"></i>Contraseña
          </label>
          <div class="input-group">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="form-control"
              id="password"
              placeholder="*********"
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
const username = ref('')
const password = ref('')
const errorMessage = ref('')
const loading = ref(false)
const showPassword = ref(false)

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
    errorMessage.value = 'Por favor complete todos los campos'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (login(username.value, password.value)) {
      return navigateTo('/dashboard')
    } else {
      errorMessage.value = 'Credenciales incorrectas'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fa;
  background-image: linear-gradient(to bottom, rgba(0, 122, 61, 0.1), rgba(255, 255, 255, 0.8));
  padding: 1rem;
}

.login-card {
  width: 100%;
  max-width: 450px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  border-top: 5px solid #007a3d;
}

.login-logo {
  margin-bottom: .5rem;
}

.text-unefa {
  color: #007a3d;
  font-weight: 800;
}

.btn-unefa {
  background-color: #007a3d;
  color: white;
  font-weight: 500;
  border: none;
  transition: background-color 0.3s;
}

.btn-unefa:hover {
  background-color: #006633;
  color: white;
}

.login-form {
  margin-top: 1.5rem;
}

/* Estilo mejorado para el botón de mostrar contraseña */
.btn-outline-secondary {
  border-color: #ced4da;
  transition: all 0.2s;
}

.btn-outline-secondary:hover {
  background-color: #f8f9fa;
}

/* Ajuste para el input de contraseña */
.input-group .form-control {
  border-right: none;
}

.input-group .btn-outline-secondary {
  border-left: none;
  background-color: white;
}

@media (max-width: 576px) {
  .login-card {
    padding: 1.5rem;
  }
  
  .login-logo {
    height: 70px;
  }
}
</style>