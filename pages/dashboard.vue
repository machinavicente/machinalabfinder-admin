<template>
  <div class="admin-dashboard">
    <AdminSidebar @logout="cerrarSesion" />
    
    <div class="admin-content">
      <!-- Resumen estadístico -->
      <div class="stats-grid">
        <div class="stat-item">
          <StatsCard 
            :value="totalSimuladores" 
            label="Simuladores" 
            icon="bi-cpu" 
            color="primary" 
          />
        </div>
        <div class="stat-item">
          <StatsCard 
            :value="totalAsignaturas" 
            label="Asignaturas" 
            icon="bi-book" 
            color="success" 
          />
        </div>
        <div class="stat-item">
          <StatsCard 
            :value="totalCategorias" 
            label="Categorías" 
            icon="bi-tags" 
            color="warning" 
            textClass="text-dark" 
          />
        </div>
        <div class="stat-item">
          <StatsCard 
            :value="totalUsuarios" 
            label="Usuarios" 
            icon="bi-people" 
            color="info" 
          />
        </div>
      </div>

      <!-- Sección de acciones rápidas -->
      <div class="card mb-4">
        <div class="card-header bg-unefa-primary text-white">
          <h5 class="mb-0">
            <i class="bi bi-lightning-charge me-2"></i>Acciones Rápidas
          </h5>
        </div>
        <div class="card-body">
          <div class="quick-actions">
            <button class="btn btn-unefa-primary" @click="abrirNuevoSimulador">
              <i class="bi bi-plus-circle me-2"></i>Nuevo Simulador
            </button>
            <button class="btn btn-outline-success" @click="exportarDatos">
              <i class="bi bi-download me-2"></i>Exportar Datos
            </button>
          </div>
        </div>
      </div>

      <!-- Tabla de simuladores -->
      <div class="card">
        <div class="card-header bg-unefa-primary text-white">
          <h5 class="mb-0">
            <i class="bi bi-cpu me-2"></i>Listado de Simuladores
          </h5>
        </div>
        <div class="card-body">
          <SimuladoresTable 
            :simuladores="simuladores" 
            @refresh="cargarSimuladores"
            @edit="abrirEditarSimulador"
            @delete="abrirEliminarSimulador"
          />
        </div>
      </div>

      <!-- Modales -->
      <SimuladorFormModal 
        :visible="modalSimuladorVisible" 
        :editMode="modoEdicion" 
        :simulador="simuladorSeleccionado"
        :categorias="categoriasDisponibles"
        :asignaturas="asignaturasOpciones"
        @close="cerrarModales"
        @submit="guardarSimulador"
      />

      <DeleteConfirmationModal 
        :visible="modalEliminarVisible"
        :simuladorNombre="simuladorSeleccionado?.nombre_del_simulador || ''"
        @close="cerrarModales"
        @confirm="confirmarEliminar"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { SupabaseClient } from '@supabase/supabase-js'
import { forbiddenKeywords } from '@/utils/validate_form.js'

// Componentes
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import StatsCard from '@/components/admin/StatsCard.vue'
import SimuladoresTable from '@/components/admin/SimuladoresTable.vue'
import SimuladorFormModal from '@/components/admin/SimuladorFormModal.vue'
import DeleteConfirmationModal from '@/components/admin/DeleteConfirmationModal.vue'

const router = useRouter()
const { $supabase } = useNuxtApp()
const supabase = $supabase as SupabaseClient

// Datos
const simuladores = ref<any[]>([])
const totalSimuladores = ref(0)
const totalAsignaturas = ref(0)
const totalCategorias = ref(0)
const totalUsuarios = ref(0)

// Estados modales
const modalSimuladorVisible = ref(false)
const modalEliminarVisible = ref(false)
const simuladorSeleccionado = ref<any>(null)
const modoEdicion = ref(false)

// Opciones de asignaturas
const asignaturasOpciones = [
  "Matemáticas", "Quimica", "Física I", "Cálculo Numérico", "Probabilidad y Estadística", 
  "Lógica Matemática", "Circuitos Lógicos", "Investigación de Operaciones", 
  "Arquitectura del Computador", "Optimización No Lineal", "Procesos Estocásticos", 
  "Geometría Analítica", "Física II", "Programación", "Lenguajes de Programación I",
  "Lenguajes de Programación II", "Lenguajes de Programación III", "Procesamiento de Datos", 
  "Bases de Datos", "Redes", "Sistemas Operativos", "Simulación y Modelos"
]

// Computed para categorías disponibles
const categoriasDisponibles = computed(() => {
  const categorias = new Set<string>()
  simuladores.value.forEach(sim => categorias.add(sim.categoria))
  return Array.from(categorias).sort()
})

// Carga los datos iniciales
async function cargarSimuladores() {
  try {
    const { data, error } = await supabase
      .from('simuladores')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    simuladores.value = data || []
    totalSimuladores.value = data?.length || 0
    
    // Calcular estadísticas
    const asignaturas = new Set(data?.map(sim => sim.asignatura))
    const categorias = new Set(data?.map(sim => sim.categoria))
    
    totalAsignaturas.value = asignaturas.size
    totalCategorias.value = categorias.size
    
    // Obtener total de usuarios
    const { count } = await supabase
      .from('usuarios')
      .select('*', { count: 'exact', head: true })
    
    totalUsuarios.value = count || 0
    
  } catch (error) {
    console.error('Error al cargar simuladores:', error)
  }
}

// Manejo de modales
function abrirNuevoSimulador() {
  modoEdicion.value = false
  simuladorSeleccionado.value = null
  modalSimuladorVisible.value = true
}

function abrirEditarSimulador(simulador: any) {
  modoEdicion.value = true
  simuladorSeleccionado.value = simulador
  modalSimuladorVisible.value = true
}

function abrirEliminarSimulador(simulador: any) {
  simuladorSeleccionado.value = simulador
  modalEliminarVisible.value = true
}

function cerrarModales() {
  modalSimuladorVisible.value = false
  modalEliminarVisible.value = false
  simuladorSeleccionado.value = null
}

// Operaciones CRUD
async function guardarSimulador(formData: any) {
  if (contieneContenidoInapropiado(formData.enlace)) {
    alert('Este enlace contiene contenido no apto para un entorno educativo.')
    return
  }

  try {
    if (modoEdicion.value && simuladorSeleccionado.value) {
      // Actualizar
      const { error } = await supabase
        .from('simuladores')
        .update({
          nombre_del_simulador: formData.nombre,
          enlace: formData.enlace,
          categoria: formData.categoria,
          asignatura: formData.asignatura,
          descripcion_del_simulador: formData.descripcion,
        })
        .eq('id', simuladorSeleccionado.value.id)

      if (error) throw error
    } else {
      // Crear nuevo
      const { data, error } = await supabase
        .from('simuladores')
        .insert([{
          nombre_del_simulador: formData.nombre,
          enlace: formData.enlace,
          categoria: formData.categoria,
          asignatura: formData.asignatura,
          descripcion_del_simulador: formData.descripcion
        }])
        .select()

      if (error) throw error
    }

    await cargarSimuladores()
    cerrarModales()
  } catch (error) {
    console.error('Error al guardar simulador:', error)
    alert(`Error al ${modoEdicion.value ? 'actualizar' : 'crear'} el simulador`)
  }
}

async function confirmarEliminar() {
  if (!simuladorSeleccionado.value) return

  try {
    const { error } = await supabase
      .from('simuladores')
      .delete()
      .eq('id', simuladorSeleccionado.value.id)

    if (error) throw error

    await cargarSimuladores()
    cerrarModales()
  } catch (error) {
    console.error('Error al eliminar simulador:', error)
    alert('Error al eliminar el simulador')
  }
}

function formatFecha(fecha: string | Date): string {
  if (!fecha) return ''
  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function escapeCsvField(field: any): string {
  const stringField = String(field === null || field === undefined ? '' : field)

  // Si el campo contiene comas, comillas dobles o saltos de línea, lo encerramos en comillas dobles.
  if (stringField.search(/("|,|\n)/g) >= 0) {
    // Escapamos las comillas dobles duplicándolas
    return `"${stringField.replace(/"/g, '""')}"`
  }
  return stringField
}

async function exportarDatos() {
  try {
    if (simuladores.value.length === 0) {
      alert('No hay datos de simuladores para exportar.')
      return
    }

    const headers = ['ID', 'Nombre', 'Asignatura', 'Categoría', 'Enlace', 'Descripción', 'Fecha de Creación']
    const rows = simuladores.value.map(sim => [
      sim.id, sim.nombre_del_simulador, sim.asignatura, sim.categoria, sim.enlace, sim.descripcion_del_simulador, formatFecha(sim.created_at)
    ])

    let csvContent = "data:text/csv;charset=utf-8," + headers.map(escapeCsvField).join(',') + '\r\n'
    rows.forEach(rowArray => {
      csvContent += rowArray.map(escapeCsvField).join(',') + '\r\n'
    })

    const link = document.createElement("a")
    link.setAttribute("href", encodeURI(csvContent))
    link.setAttribute("download", `simuladores_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('Error al exportar datos:', error)
    alert('Ocurrió un error al intentar exportar los datos.')
  }
}

// Utilidades
function contieneContenidoInapropiado(url: string): boolean {
  const lowerUrl = url.toLowerCase()
  return forbiddenKeywords.some(keyword => lowerUrl.includes(keyword.toLowerCase()))
}

function cerrarSesion() {
  localStorage.removeItem("usuario");
  router.replace("/");
  setTimeout(() => window.location.reload(), 100);
}
// Carga inicial
onMounted(() => {
  cargarSimuladores()
})
</script>

<style scoped>
.admin-dashboard {
  display: flex;
  min-height: 100vh;
  padding: 0;
  background-color: #f5f7fa;
}

.admin-content {
  margin-left: 250px;
  flex: 1;
  padding: 1.5rem;
  transition: margin-left 0.3s ease;
  overflow-x: hidden;
}

.bg-unefa-primary {
  background-color: #002147;
}

.btn-unefa-primary {
  background-color: #007a3d;
  color: white;
  border: none;
  transition: all 0.3s ease;
}

.btn-unefa-primary:hover {
  background-color: #006633;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.card {
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: none;
  margin-bottom: 1.5rem;
}

.card-header {
  border-radius: 10px 10px 0 0 !important;
  padding: 1rem 1.5rem;
}

.card-header h5 {
  color: #FFC72C;
  font-weight: 600;
  display: flex;
  align-items: center;
}

/* Estilos para el grid de estadísticas */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  min-width: 0; /* Evita que las tarjetas se desborden */
}

/* Estilos para acciones rápidas */
.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.quick-actions .btn {
  flex: 1 1 auto;
  min-width: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  white-space: nowrap;
}

/* Media queries para responsive design */
@media (max-width: 1199.98px) {
  .admin-content {
    padding: 1.25rem;
  }
  
  .stats-grid {
    gap: 1rem;
  }
}

@media (max-width: 991.98px) {
  .admin-content {
    margin-left: 0;
    padding: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .quick-actions .btn {
    min-width: 160px;
  }
}

@media (max-width: 767.98px) {
  .admin-content {
    padding: 0.75rem;
  }
  
  .card-header h5 {
    font-size: 1.1rem;
  }
  
  .quick-actions {
    flex-direction: column;
  }
  
  .quick-actions .btn {
    width: 100%;
    min-width: 0;
  }
}

@media (max-width: 575.98px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .admin-content {
    padding: 0.5rem;
  }
  
  .card-header {
    padding: 0.75rem 1rem;
  }
  
  .card-header h5 {
    font-size: 1rem;
  }
  
  .quick-actions .btn {
    padding: 0.5rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 400px) {
  .admin-content {
    padding: 0.5rem 0.25rem;
  }
  
  .card-header h5 {
    font-size: 0.95rem;
  }
  
  .card-header h5 i {
    margin-right: 0.5rem;
  }
}
</style>