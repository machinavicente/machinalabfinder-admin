<template>
  <div class="admin-dashboard">
    <AdminSidebar @logout="cerrarSesion" />
    
    <div class="admin-content">
      <!-- Resumen estadístico -->
      <div class="stats-row">
        <div class="stat-card">
          <StatsCard 
            :value="usuariosActivos" 
            label="Usuarios Activos" 
            icon="bi-person-check" 
            color="success" 
          />
        </div>
        <div class="stat-card">
          <StatsCard 
            :value="usuariosRecientes" 
            label="Nuevos (7 días)" 
            icon="bi-person-plus" 
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
            <button class="btn btn-unefa-primary" @click="abrirNuevoUsuario">
              <i class="bi bi-person-plus me-2"></i>Nuevo Usuario
            </button>
            <button class="btn btn-outline-success" @click="exportarUsuarios">
              <i class="bi bi-download me-2"></i>Exportar CSV
            </button>
            <button 
              class="btn btn-outline-danger" 
              @click="abrirEliminacionMasiva"
              :disabled="!usuariosSeleccionados.length"
            >
              <i class="bi bi-trash me-2"></i>Eliminar Seleccionados
            </button>
          </div>
        </div>
      </div>

      <!-- Filtros de búsqueda -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="filter-grid">
            <div class="filter-item">
              <label for="busqueda" class="form-label">Buscar</label>
              <input 
                type="text" 
                class="form-control" 
                id="busqueda" 
                placeholder="Nombre, email..." 
                v-model="filtroBusqueda"
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de usuarios -->
      <div class="card">
        <div class="card-header bg-unefa-primary text-white">
          <h5 class="mb-0">
            <i class="bi bi-people-fill me-2"></i>Listado de Usuarios
          </h5>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th scope="col" class="select-col">
                    <input 
                      type="checkbox" 
                      class="form-check-input" 
                      @change="seleccionarTodos"
                      :checked="usuariosSeleccionados.length === usuariosFiltrados.length && usuariosFiltrados.length > 0"
                    >
                  </th>
                  <th scope="col" class="name-col">Nombre</th>
                  <th scope="col" class="email-col">Email</th>
                  <th scope="col" class="alt-email-col">Email Alternativo</th>
                  <th scope="col" class="date-col">Fecha Registro</th>
                  <th scope="col" class="actions-col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="usuario in usuariosFiltrados" :key="usuario.id">
                  <td class="select-col">
                    <input 
                      type="checkbox" 
                      class="form-check-input" 
                      v-model="usuariosSeleccionados"
                      :value="usuario.id"
                    >
                  </td>
                  <td class="name-col">{{ usuario.nombre }} {{ usuario.apellido }}</td>
                  <td class="email-col">{{ usuario.email }}</td>
                  <td class="alt-email-col">{{ usuario.emailAlternativo || '-' }}</td>
                  <td class="date-col">{{ formatFecha(usuario.creado_en) }}</td>
                  <td class="actions-col">
                    <div class="action-buttons">
                      <button 
                        class="btn btn-sm btn-outline-primary me-2"
                        @click="abrirEditarUsuario(usuario)"
                      >
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button 
                        class="btn btn-sm btn-outline-danger"
                        @click="abrirEliminarUsuario(usuario)"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="usuariosFiltrados.length === 0">
                  <td colspan="6" class="text-center text-muted py-4">
                    No se encontraron usuarios
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Paginación -->
          <nav v-if="totalPaginas > 1">
            <ul class="pagination justify-content-center">
              <li class="page-item" :class="{ disabled: paginaActual === 1 }">
                <button class="page-link" @click="paginaAnterior">&laquo;</button>
              </li>
              <li 
                class="page-item" 
                v-for="pagina in totalPaginas" 
                :key="pagina"
                :class="{ active: pagina === paginaActual }"
              >
                <button class="page-link" @click="irAPagina(pagina)">{{ pagina }}</button>
              </li>
              <li class="page-item" :class="{ disabled: paginaActual === totalPaginas }">
                <button class="page-link" @click="paginaSiguiente">&raquo;</button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <!-- Modales -->
      <UsuarioFormModal 
        :visible="modalUsuarioVisible" 
        :editMode="modoEdicion" 
        :usuario="usuarioSeleccionado"
        @close="cerrarModales"
        @submit="guardarUsuario"
      />

      <DeleteConfirmationModal 
        :visible="modalEliminarVisible"
        :itemNombre="usuarioSeleccionado ? `${usuarioSeleccionado.nombre} ${usuarioSeleccionado.apellido}` : ''"
        itemType="usuario"
        @close="cerrarModales"
        @confirm="confirmarEliminar"
      />

      <BulkDeleteModal 
        :visible="modalEliminacionMasivaVisible"
        :cantidad="usuariosSeleccionados.length"
        itemType="usuarios"
        @close="cerrarModales"
        @confirm="confirmarEliminacionMasiva"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { SupabaseClient } from '@supabase/supabase-js'

// Componentes
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import StatsCard from '@/components/admin/StatsCard.vue'
import UsuarioFormModal from '@/components/admin/UsuarioFormModal.vue'
import DeleteConfirmationModal from '@/components/admin/DeleteConfirmationModal.vue'
import BulkDeleteModal from '@/components/admin/BulkDeleteModal.vue'

const router = useRouter()
const { $supabase } = useNuxtApp()
const supabase = $supabase as SupabaseClient

// Datos y estado
const usuarios = ref<any[]>([])
const totalUsuarios = ref(0)
const usuariosActivos = ref(0)
const usuariosRecientes = ref(0)
const usuariosSeleccionados = ref<number[]>([])

// Filtros y paginación
const filtroBusqueda = ref('')
const ordenarPor = ref('creado_en')
const ordenDireccion = ref('desc')
const paginaActual = ref(1)
const usuariosPorPagina = ref(10)

// Estados modales
const modalUsuarioVisible = ref(false)
const modalEliminarVisible = ref(false)
const modalEliminacionMasivaVisible = ref(false)
const usuarioSeleccionado = ref<any>(null)
const modoEdicion = ref(false)

// Carga los datos iniciales
async function cargarUsuarios() {
  try {
    // Obtener conteo total
    const { count } = await supabase
      .from('usuarios')
      .select('*', { count: 'exact', head: true })
    
    totalUsuarios.value = count || 0

    // Obtener usuarios activos (último mes)
    const { count: activos } = await supabase
      .from('usuarios')
      .select('*', { count: 'exact', head: true })
      .gt('creado_en', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    
    usuariosActivos.value = activos || 0

    // Obtener usuarios recientes (última semana)
    const { count: recientes } = await supabase
      .from('usuarios')
      .select('*', { count: 'exact', head: true })
      .gt('creado_en', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    
    usuariosRecientes.value = recientes || 0

    // Obtener lista completa de usuarios
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order(ordenarPor.value, { ascending: ordenDireccion.value === 'asc' })
    
    if (error) throw error
    
    usuarios.value = data || []
    
  } catch (error) {
    console.error('Error al cargar usuarios:', error)
  }
}

// Usuarios filtrados y paginados
const usuariosFiltrados = computed(() => {
  let resultado = usuarios.value
  
  // Aplicar filtro de búsqueda
  if (filtroBusqueda.value) {
    const busqueda = filtroBusqueda.value.toLowerCase()
    resultado = resultado.filter(u => 
      u.nombre.toLowerCase().includes(busqueda) ||
      u.apellido.toLowerCase().includes(busqueda) ||
      u.email.toLowerCase().includes(busqueda) ||
      (u.emailAlternativo && u.emailAlternativo.toLowerCase().includes(busqueda))
    )
  }
  
  return resultado
})

const usuariosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * usuariosPorPagina.value
  const fin = inicio + usuariosPorPagina.value
  return usuariosFiltrados.value.slice(inicio, fin)
})

const totalPaginas = computed(() => {
  return Math.ceil(usuariosFiltrados.value.length / usuariosPorPagina.value)
})

// Manejo de paginación
function irAPagina(pagina: number) {
  paginaActual.value = pagina
}

function paginaAnterior() {
  if (paginaActual.value > 1) {
    paginaActual.value--
  }
}

function paginaSiguiente() {
  if (paginaActual.value < totalPaginas.value) {
    paginaActual.value++
  }
}

// Manejo de selección
function seleccionarTodos(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.checked) {
    usuariosSeleccionados.value = usuariosFiltrados.value.map(u => u.id)
  } else {
    usuariosSeleccionados.value = []
  }
}

// Manejo de modales
function abrirNuevoUsuario() {
  modoEdicion.value = false
  usuarioSeleccionado.value = null
  modalUsuarioVisible.value = true
}

function abrirEditarUsuario(usuario: any) {
  modoEdicion.value = true
  usuarioSeleccionado.value = { ...usuario }
  modalUsuarioVisible.value = true
}

function abrirEliminarUsuario(usuario: any) {
  usuarioSeleccionado.value = usuario
  modalEliminarVisible.value = true
}

function abrirEliminacionMasiva() {
  modalEliminacionMasivaVisible.value = true
}

function cerrarModales() {
  modalUsuarioVisible.value = false
  modalEliminarVisible.value = false
  modalEliminacionMasivaVisible.value = false
  usuarioSeleccionado.value = null
}

// Operaciones CRUD
async function guardarUsuario(formData: any) {
  try {
    if (modoEdicion.value && usuarioSeleccionado.value) {
      // Actualizar usuario
      const { error } = await supabase
        .from('usuarios')
        .update({
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          emailAlternativo: formData.emailAlternativo
        })
        .eq('id', usuarioSeleccionado.value.id)

      if (error) throw error
    } else {
      // Crear nuevo usuario
      const { data, error } = await supabase
        .from('usuarios')
        .insert([{
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          emailAlternativo: formData.emailAlternativo,
          password_hash: 'temp_password', // Se debe implementar lógica de hash
          salt: 'temp_salt' // Se debe implementar generación de salt
        }])
        .select()

      if (error) throw error
    }

    await cargarUsuarios()
    cerrarModales()
  } catch (error) {
    console.error('Error al guardar usuario:', error)
    alert(`Error al ${modoEdicion.value ? 'actualizar' : 'crear'} el usuario`)
  }
}

async function confirmarEliminar() {
  if (!usuarioSeleccionado.value) return

  try {
    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', usuarioSeleccionado.value.id)

    if (error) throw error

    await cargarUsuarios()
    cerrarModales()
  } catch (error) {
    console.error('Error al eliminar usuario:', error)
    alert('Error al eliminar el usuario')
  }
}

async function confirmarEliminacionMasiva() {
  try {
    const { error } = await supabase
      .from('usuarios')
      .delete()
      .in('id', usuariosSeleccionados.value)

    if (error) throw error

    usuariosSeleccionados.value = []
    await cargarUsuarios()
    cerrarModales()
  } catch (error) {
    console.error('Error al eliminar usuarios:', error)
    alert('Error al eliminar los usuarios seleccionados')
  }
}

// Exportar datos
async function exportarUsuarios() {
  try {
    // Crear contenido CSV
    let csvContent = "data:text/csv;charset=utf-8,"
    csvContent += "ID,Nombre,Apellido,Email,Email Alternativo,Fecha Registro\n"
    
    usuariosFiltrados.value.forEach(u => {
      csvContent += `${u.id},${u.nombre},${u.apellido},${u.email},${u.emailAlternativo || ''},${formatFecha(u.creado_en)}\n`
    })
    
    // Crear enlace de descarga
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `usuarios_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('Error al exportar usuarios:', error)
    alert('Error al exportar los datos')
  }
}

// Utilidades
function formatFecha(fecha: string) {
  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function cerrarSesion() {
  localStorage.removeItem("usuario");
  router.replace("/");
  setTimeout(() => window.location.reload(), 100);
}

// Carga inicial
onMounted(() => {
  cargarUsuarios()
})
</script>>

<style scoped>
.admin-dashboard {
  display: flex;
  min-height: 100vh;
  padding: 0;
}

.admin-content {
  margin-left: 250px;
  flex: 1;
  padding: 1.5rem;
  background-color: #f5f7fa;
  transition: margin-left 0.3s ease;
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

.table th {
  background-color: #f8f9fa;
  border-top: 1px solid #dee2e6;
}

/* Estilos para la paginación */
.pagination .page-item.active .page-link {
  background-color: #007a3d;
  border-color: #007a3d;
}

.pagination .page-link {
  color: #007a3d;
}

.pagination .page-item.active .page-link {
  color: white;
}

/* Estilos responsive */
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  min-width: 0;
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.filter-item {
  min-width: 0;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 0.5rem;
}

/* Estilos para la tabla en dispositivos pequeños */
@media (max-width: 991.98px) {
  .admin-content {
    margin-left: 0;
    padding: 1rem;
  }
  
  .table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
  
  .select-col {
    width: 40px;
  }
  
  .name-col {
    min-width: 150px;
  }
  
  .email-col {
    min-width: 200px;
  }
  
  .alt-email-col {
    min-width: 180px;
  }
  
  .date-col {
    min-width: 120px;
  }
  
  .actions-col {
    min-width: 100px;
  }
}

@media (max-width: 767.98px) {
  .quick-actions {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .quick-actions .btn {
    width: 100%;
  }
  
  .action-buttons {
    justify-content: center;
  }
  
  .stats-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 575.98px) {
  .admin-content {
    padding: 0.75rem;
  }
  
  .card-header h5 {
    font-size: 1.1rem;
  }
  
  .pagination {
    flex-wrap: wrap;
  }
  
  .page-item {
    margin-bottom: 0.5rem;
  }
}
</style>