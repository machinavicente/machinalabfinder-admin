<template>
  <div v-if="visible" class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-window">
      <h5 class="modal-title text-danger">
        <i class="bi bi-exclamation-triangle me-2"></i>Confirmar Eliminación
      </h5>
      <p>
        ¿Está seguro que desea eliminar el simulador
        <strong>"{{ simuladorNombre }}"</strong>?
      </p>
      <div class="d-flex justify-content-end gap-2">
        <button type="button" class="btn btn-secondary" @click="$emit('close')">Cancelar</button>
        <button type="button" class="btn btn-danger" @click="$emit('confirm')">
          <i class="bi bi-trash me-1"></i> Eliminar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  simuladorNombre: {
    type: String,
    default: ''
  }
})

defineEmits(['close', 'confirm'])
</script>

<style scoped>
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

.modal-window {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  width: 500px;
  max-width: 95%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-title {
  font-weight: 600;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
}
</style>