<template>
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
              <div class="form-text">Opcional</div>
            </div>
            
            <div class="row mb-3" v-if="!editMode">
              <div class="col-md-6">
                <label for="password" class="form-label">Contraseña</label>
                <input 
                  type="password" 
                  class="form-control" 
                  id="password" 
                  v-model="form.password"
                  required
                >
              </div>
              <div class="col-md-6">
                <label for="confirmPassword" class="form-label">Confirmar Contraseña</label>
                <input 
                  type="password" 
                  class="form-control" 
                  id="confirmPassword" 
                  v-model="form.confirmPassword"
                  required
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
  <div class="modal-backdrop fade show" v-if="visible"></div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps({
  visible: Boolean,
  editMode: Boolean,
  usuario: Object
})

const emit = defineEmits(['close', 'submit'])

const form = ref({
  nombre: '',
  apellido: '',
  email: '',
  emailAlternativo: '',
  password: '',
  confirmPassword: ''
})

// Cuando cambia el usuario seleccionado (para edición)
watch(() => props.usuario, (newVal) => {
  if (newVal) {
    form.value = {
      nombre: newVal.nombre || '',
      apellido: newVal.apellido || '',
      email: newVal.email || '',
      emailAlternativo: newVal.emailAlternativo || '',
      password: '',
      confirmPassword: ''
    }
  } else {
    resetForm()
  }
}, { immediate: true })

function resetForm() {
  form.value = {
    nombre: '',
    apellido: '',
    email: '',
    emailAlternativo: '',
    password: '',
    confirmPassword: ''
  }
}

function submitForm() {
  if (!props.editMode && form.value.password !== form.value.confirmPassword) {
    alert('Las contraseñas no coinciden')
    return
  }
  
  emit('submit', {
    nombre: form.value.nombre,
    apellido: form.value.apellido,
    email: form.value.email,
    emailAlternativo: form.value.emailAlternativo,
    password: props.editMode ? undefined : form.value.password
  })
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
</style>