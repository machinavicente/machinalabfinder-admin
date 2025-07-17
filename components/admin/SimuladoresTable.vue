<template>
  <div class="card">
    <div class="card-header bg-unefa-primary text-white d-flex justify-content-between align-items-center">
      <h5 class="mb-0">
        <i class="bi bi-list-check me-2"></i>Listado de Simuladores
      </h5>
      <div class="d-flex gap-2">
        <input v-model="terminoBusqueda" type="text" class="form-control form-control-sm" placeholder="Buscar..." />
        <button class="btn btn-sm btn-light" @click="$emit('refresh')">
          <i class="bi bi-arrow-clockwise"></i>
        </button>
      </div>
    </div>
    <div class="card-body">
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Asignatura</th>
              <th>Categoría</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sim in simuladoresPaginados" :key="sim.id">
              <td>{{ sim.nombre_del_simulador }}</td>
              <td>
                <span class="badge bg-secondary">{{ sim.asignatura }}</span>
              </td>
              <td>
                <span class="badge  text-dark">{{ sim.categoria }}</span>
              </td>
              <td>{{ formatDate(sim.created_at) }}</td>
              <td>
                <div class="d-flex gap-2">
                  <button class="btn btn-sm btn-outline-primary" @click="$emit('edit', sim)">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="$emit('delete', sim)">
                    <i class="bi bi-trash"></i>
                  </button>
                  <a :href="sim.enlace" target="_blank" class="btn btn-sm btn-outline-success">
                    <i class="bi bi-play"></i>
                  </a>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <nav v-if="totalPaginas > 1">
        <ul class="pagination justify-content-center">
          <li class="page-item" :class="{ disabled: paginaActual === 1 }">
            <button class="page-link" @click="paginaActual--">&laquo;</button>
          </li>
          <li v-for="n in totalPaginas" :key="n" class="page-item" :class="{ active: n === paginaActual }">
            <button class="page-link" @click="paginaActual = n">{{ n }}</button>
          </li>
          <li class="page-item" :class="{ disabled: paginaActual === totalPaginas }">
            <button class="page-link" @click="paginaActual++">&raquo;</button>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'


const props = defineProps({
  simuladores: {
    type: Array as () => Array<{
      id: number
      nombre_del_simulador: string
      enlace: string
      categoria: string
      asignatura: string
      descripcion_del_simulador: string
      created_at: string
    }>,
    required: true
  }
})

defineEmits(['refresh', 'edit', 'delete'])

const terminoBusqueda = ref('')
const paginaActual = ref(1)
const itemsPorPagina = 10

const simuladoresFiltrados = computed(() => {
  const termino = terminoBusqueda.value.toLowerCase()
  return props.simuladores.filter(sim => 
    sim.nombre_del_simulador.toLowerCase().includes(termino) ||
    sim.asignatura.toLowerCase().includes(termino) ||
    sim.categoria.toLowerCase().includes(termino) ||
    sim.descripcion_del_simulador.toLowerCase().includes(termino)
  )
})

const simuladoresPaginados = computed(() => {
  const start = (paginaActual.value - 1) * itemsPorPagina
  return simuladoresFiltrados.value.slice(start, start + itemsPorPagina)
})

const totalPaginas = computed(() => 
  Math.ceil(simuladoresFiltrados.value.length / itemsPorPagina)
)

function formatDate(fechaISO: string) {
  const date = new Date(fechaISO)
  return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<style scoped>
.bg-unefa-primary {
  background-color: #002147;
}

.table th {
  background-color: #f8f9fa;
  border-bottom-width: 1px;
}
h5{
  color: #FFC72C;
}
</style>