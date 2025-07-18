<template>
  <div v-if="visible" class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-window">
      <h5 class="modal-title">
        <i
          class="bi me-2"
          :class="
            editMode ? 'bi-pencil text-warning' : 'bi-plus-circle text-primary'
          "
        ></i>
        {{ editMode ? "Editar Simulador" : "Nuevo Simulador" }}
      </h5>
      <form @submit.prevent="$emit('submit', formData)">
        <div class="mb-3">
          <label class="form-label">Nombre</label>
          <input
            v-model="formData.nombre"
            type="text"
            class="form-control"
            required
          />
        </div>
        <div class="mb-3">
          <label class="form-label">Enlace</label>
          <input
            v-model="formData.enlace"
            type="url"
            class="form-control"
            required
          />
        </div>
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Categoría</label>
            <input
              v-model="formData.categoria"
              type="text"
              class="form-control"
              list="categoriasList"
              required
            />
            <datalist id="categoriasList">
              <option
                v-for="cat in categorias"
                :key="cat"
                :value="cat"
              ></option>
            </datalist>
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">Asignatura</label>
            <select v-model="formData.asignatura" class="form-select" required>
              <option value="" disabled>Seleccione asignatura</option>
              <option v-for="asig in asignaturas" :key="asig" :value="asig">
                {{ asig }}
              </option>
            </select>
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label">Descripción</label>
          <textarea
            v-model="formData.descripcion"
            class="form-control"
            rows="3"
            required
          ></textarea>
        </div>
        <div class="mb-3 fecha" v-if="!editMode">
          <label class="form-label">Fecha de creación</label>
          <input
            type="text"
            class="form-control"
            :value="formattedToday"
            readonly
            disabled
          />
        </div>
        <div class="d-flex justify-content-end gap-2">
          <button
            type="button"
            class="btn btn-secondary"
            @click="$emit('close')"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="btn"
            :class="editMode ? 'btn-warning' : 'btn-primary'"
          >
            {{ editMode ? "Actualizar" : "Guardar" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

const today = new Date()
const formattedToday = computed(() => {
  return today.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})
const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  editMode: {
    type: Boolean,
    default: false,
  },
  simulador: {
    type: Object as () => {
      id?: number;
      nombre_del_simulador?: string;
      enlace?: string;
      categoria?: string;
      asignatura?: string;
      descripcion_del_simulador?: string;
    },
    default: null,
  },
  categorias: {
    type: Array as () => string[],
    default: () => [],
  },
  asignaturas: {
    type: Array as () => string[],
    default: () => [],
  },
});

const emit = defineEmits(["close", "submit"]);

const formData = ref({
  nombre: "",
  enlace: "",
  categoria: "",
  asignatura: "",
  descripcion: "",
});

watch(
  () => props.simulador,
  (newVal) => {
    if (newVal) {
      formData.value = {
        nombre: newVal.nombre_del_simulador || "",
        enlace: newVal.enlace || "",
        categoria: newVal.categoria || "",
        asignatura: newVal.asignatura || "",
        descripcion: newVal.descripcion_del_simulador || "",
      };
    } else {
      formData.value = {
        nombre: "",
        enlace: "",
        categoria: "",
        asignatura: "",
        descripcion: "",
      };
    }
  },
  { immediate: true }
);
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
.fecha{
  display: none;
}
</style>
