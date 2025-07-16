<template>
  <div class="modal fade show" tabindex="-1" role="dialog" style="display: block;" v-if="visible">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header bg-danger text-white">
          <h5 class="modal-title">
            <i class="bi bi-exclamation-triangle me-2"></i>
            Confirmar Eliminación Masiva
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <p>
            ¿Estás seguro que deseas eliminar los <strong>{{ cantidad }} {{ itemType }}</strong> seleccionados?
          </p>
          <p class="text-danger">
            <i class="bi bi-exclamation-circle-fill"></i> Esta acción no se puede deshacer.
          </p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" @click="$emit('close')">
            Cancelar
          </button>
          <button type="button" class="btn btn-danger" @click="$emit('confirm')">
            <i class="bi bi-trash me-1"></i> Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade show" v-if="visible"></div>
</template>

<script setup lang="ts">
defineProps({
  visible: Boolean,
  cantidad: Number,
  itemType: String
})

defineEmits(['close', 'confirm'])
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
</style>