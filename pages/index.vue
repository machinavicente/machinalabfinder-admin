<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Logo UNEFA -->
      <div class="text-center mb-4">
        <img src="public/assets/images/logo.png" alt="UNEFA Logo" class="login-logo" />
        <h3 class="mt-3 text-unefa">Coordinación de Ingeniería de Sistemas</h3>
        <p class="text-muted">Extensión Zaraza</p>
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

        <!-- Campo de contraseña -->
        <div class="mb-4">
          <label for="password" class="form-label">
            <i class="bi bi-lock-fill me-2"></i>Contraseña
          </label>
          <div class="input-group">
            <input
              v-model="password"
              type="password"
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
// Estado del formulario
const username = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const showHelpModal = ref(false)

// Función para alternar visibilidad de contraseña
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
  const passwordInput = document.getElementById('password') as HTMLInputElement
  if (passwordInput) {
    passwordInput.type = showPassword.value ? 'text' : 'password'
  }
}

// Función para manejar el inicio de sesión
const handleLogin = async () => {
  // Validación básica
  if (!username.value || !password.value) {
    errorMessage.value = 'Por favor complete todos los campos'
    return
  }

  // Validar credenciales exactas
  const defaultUsername = 'unefa-ext-zaraza'
  const defaultPassword = 'unefa-zaraza'

  if (username.value !== defaultUsername || password.value !== defaultPassword) {
    errorMessage.value = 'Usuario o contraseña incorrectos. Intente nuevamente.'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    // Simulación de autenticación
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Redirigir al dashboard
    navigateTo('/dashboard')
  } catch (error) {
    errorMessage.value = 'Error al conectar con el servidor. Intente más tarde.'
    console.error('Login error:', error)
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
  height: 80px;
  margin-bottom: 1rem;
}

.text-unefa {
  color: #007a3d;
  font-weight: 600;
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

.bg-unefa {
  background-color: #007a3d !important;
}

.login-form {
  margin-top: 1.5rem;
}

.input-group-text {
  font-size: 0.9rem;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  overflow: hidden;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
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