<template>
  <!-- Modal principal para crear/editar usuario -->
  <div class="modal fade show" tabindex="-1" role="dialog" style="display: block;" v-if="visible">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header bg-unefa-primary text-white">
          <h5 class="modal-title">
            <i class="bi" :class="editMode ? 'bi-person-gear' : 'bi-person-plus'"></i>
            {{ editMode ? 'Editar Usuario' : 'Nuevo Usuario' }}
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitForm">
            <div class="row mb-3">
              <div class="col-md-6">
                <label for="nombre" class="form-label">Nombre</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="nombre" 
                  v-model="form.nombre" 
                  required
                >
              </div>
              <div class="col-md-6">
                <label for="apellido" class="form-label">Apellido</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="apellido" 
                  v-model="form.apellido" 
                  required
                >
              </div>
            </div>
            
            <div class="mb-3">
              <label for="email" class="form-label">Email Principal</label>
              <input 
                type="email" 
                class="form-control" 
                id="email" 
                v-model="form.email" 
                required
              >
            </div>
            
            <div class="mb-3">
              <label for="emailAlternativo" class="form-label">Email Alternativo</label>
              <input 
                type="email" 
                class="form-control" 
                id="emailAlternativo" 
                v-model="form.emailAlternativo"
              >
            </div>
            
            <div class="row mb-3" v-if="!editMode">
              <div class="col-md-6">
                <label for="password" class="form-label">Contraseña</label>
                <input 
                  placeholder="labfinder-user"
                  type="text" 
                  class="form-control" 
                  id="password" 
                  v-model="form.password"
                  readonly
                >
              </div>
            </div>
            
            <div class="d-flex justify-content-end gap-2 mt-4">
              <button type="button" class="btn btn-outline-secondary" @click="$emit('close')">
                Cancelar
              </button>
              <button type="submit" class="btn btn-unefa-primary">
                {{ editMode ? 'Actualizar' : 'Crear' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>


  <!-- Backdrop para ambos modales -->
  <div class="modal-backdrop fade show" v-if="visible || showSuccessModal"></div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps({
  visible: Boolean,
  editMode: Boolean,
  usuario: Object
})

const emit = defineEmits(['close', 'submit', 'refresh'])

const form = ref({
  nombre: '',
  apellido: '',
  email: '',
  emailAlternativo: '',
  password: 'unefa-user' // Valor por defecto para nuevo usuario
})

const showSuccessModal = ref(false)

// Cuando cambia el usuario seleccionado (para edición)
watch(() => props.usuario, (newVal) => {
  if (newVal) {
    form.value = {
      nombre: newVal.nombre || '',
      apellido: newVal.apellido || '',
      email: newVal.email || '',
      emailAlternativo: newVal.emailAlternativo || '',
      password: '' // No mostrar contraseña en edición
    }
  } else {
    resetForm()
  }
}, { immediate: true })

// Limpiar completamente el formulario
function resetForm() {
  form.value = {
    nombre: '',
    apellido: '',
    email: '',
    emailAlternativo: '',
    password: 'labfinder-user' // Restablecer valor por defecto
  }
}

function submitForm() {
  emit('submit', {
    nombre: form.value.nombre,
    apellido: form.value.apellido,
    email: form.value.email,
    emailAlternativo: form.value.emailAlternativo,
    password: props.editMode ? undefined : form.value.password
  })
  
  // Mostrar modal de éxito solo cuando no es edición
  if (!props.editMode) {
    showSuccessModal.value = true
    resetForm() // Limpiar el formulario después de enviar
  } else {
    emit('close')
  }
}

function closeSuccessModal() {
  showSuccessModal.value = false
  emit('close')
  emit('refresh') // Emitir evento para refrescar la lista de usuarios
}
</script>

<style scoped>
.modal-content {
  border: none;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.modal-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.modal-backdrop {
  opacity: 0.5;
}

.bg-unefa-primary {
  background-color: #002147;
}

.btn-unefa-primary {
  background-color: #007a3d;
  color: white;
  border: none;
}

.btn-unefa-primary:hover {
  background-color: #006633;
  color: white;
}

/* Estilos para el modal de éxito */
.modal-md {
  max-width: 500px;
}

.text-success {
  color: #28a745 !important;
}

.bg-success {
  background-color: #28a745 !important;
}
</style>