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

      <!-- Formulario de inicio de sesión -->
      <form @submit.prevent="handleLogin" class="auth-form">
        <!-- Mensaje de error -->
        <div v-if="errorMessage" class="alert alert-danger d-flex align-items-center">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          <span>{{ errorMessage }}</span>
        </div>

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
      return navigateTo('/panel')
    } else {
      errorMessage.value = 'Credenciales incorrectas'
    }
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

.btn-unefa{
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

.alert {
  border-radius: 8px;
}


@media (max-width: 576px) {
  .auth-card {
    padding: 1.5rem;
  }
  
  .auth-logo {
    height: 70px;
  }
}
</style>