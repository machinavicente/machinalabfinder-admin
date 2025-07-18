<template>
  <div class="admin-dashboard">
    <AdminSidebar @logout="handleLogout" />
    
    <div class="admin-content">
      <h2 class="mb-4 text-unefa-primary">Panel de Usuarios</h2>
      <!-- Resumen estadístico mejorado -->
      <div class="stats-grid">
        <div class="stat-card">
          <StatsCard 
            :value="totalUsuarios" 
            label="Usuarios Totales" 
            icon="bi-people-fill" 
            color="primary"
            trend="up"
            trend-value="12%"
          />
        </div>
        <div class="stat-card">
          <StatsCard 
            :value="usuariosRecientes" 
            label="Nuevos (7 días)" 
            icon="bi-person-plus" 
            color="info"
            trend="down"
            trend-value="3%"
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
        @refresh="cargarUsuarios"
      />

      <!-- Modal de confirmación para eliminar usuario -->
      <div class="modal fade show" tabindex="-1" role="dialog" style="display: block;" v-if="modalEliminarVisible">
        <div class="modal-dialog modal-dialog-centered" role="document">
          <div class="modal-content">
            <div class="modal-header bg-danger text-white">
              <h5 class="modal-title">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                Confirmar Eliminación
              </h5>
              <button type="button" class="btn-close btn-close-white" @click="cerrarModales"></button>
            </div>
            <div class="modal-body">
              <div class="text-center">
                <i class="bi bi-exclamation-circle text-danger" style="font-size: 3rem;"></i>
                <h4 class="mt-3">¿Estás seguro de eliminar este usuario?</h4>
                <p class="mb-0">
                  El usuario <strong>{{ usuarioSeleccionado?.nombre }} {{ usuarioSeleccionado?.apellido }}</strong> 
                  será eliminado permanentemente.
                </p>
              </div>
            </div>
            <div class="modal-footer justify-content-center">
              <button type="button" class="btn btn-outline-secondary" @click="cerrarModales">
                Cancelar
              </button>
              <button type="button" class="btn btn-danger" @click="confirmarEliminar">
                <i class="bi bi-trash me-2"></i>Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de confirmación para eliminación  -->
      <div class="modal fade show" tabindex="-1" role="dialog" style="display: block;" v-if="modalEliminacionMasivaVisible">
        <div class="modal-dialog modal-dialog-centered" role="document">
          <div class="modal-content">
            <div class="modal-header bg-danger text-white">
              <h5 class="modal-title">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                Confirmar Eliminación
              </h5>
              <button type="button" class="btn-close btn-close-white" @click="cerrarModales"></button>
            </div>
            <div class="modal-body">
              <div class="text-center">
                <i class="bi bi-exclamation-circle text-danger" style="font-size: 3rem;"></i>
                <h4 class="mt-3">¿Estás seguro de eliminar los usuarios seleccionados?</h4>
                <p class="mb-0">
                  Se eliminarán permanentemente <strong>{{ usuariosSeleccionados.length }}</strong> usuarios.
                </p>
              </div>
            </div>
            <div class="modal-footer justify-content-center">
              <button type="button" class="btn btn-outline-secondary" @click="cerrarModales">
                Cancelar
              </button>
              <button type="button" class="btn btn-danger" @click="confirmarEliminacionMasiva">
                <i class="bi bi-trash me-2"></i>Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de éxito después de eliminar -->
      <div class="modal fade show" tabindex="-1" role="dialog" style="display: block;" v-if="showDeleteSuccessModal">
        <div class="modal-dialog modal-dialog-centered" role="document">
          <div class="modal-content">
            <div class="modal-header bg-success text-white">
              <h5 class="modal-title">
                <i class="bi bi-check-circle-fill me-2"></i>
                Eliminación Exitosa
              </h5>
              <button type="button" class="btn-close btn-close-white" @click="showDeleteSuccessModal = false"></button>
            </div>
            <div class="modal-body text-center">
              <i class="bi bi-check-circle-fill text-success" style="font-size: 3rem;"></i>
              <h4 class="mt-3">¡Usuario(s) eliminado(s) con éxito!</h4>
              <p>La operación se completó correctamente.</p>
            </div>
            <div class="modal-footer justify-content-center">
              <button type="button" class="btn btn-success" @click="showDeleteSuccessModal = false">
                Aceptar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Backdrop para todos los modales -->
      <div class="modal-backdrop fade show" v-if="modalUsuarioVisible || modalEliminarVisible || modalEliminacionMasivaVisible || showDeleteSuccessModal"></div>
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
const { isAuthenticated, logout } = useAuth()
const router = useRouter()
const { $supabase } = useNuxtApp()
const supabase = $supabase as SupabaseClient

// Datos y estado
const usuarios = ref<any[]>([])
const totalUsuarios = ref(0)
const usuariosActivos = ref(0)
const usuariosRecientes = ref(0)
const usuariosInactivos = ref(0)
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
const showDeleteSuccessModal = ref(false)
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

    // Obtener usuarios inactivos (más de 30 días sin actividad)
    const { count: inactivos } = await supabase
      .from('usuarios')
      .select('*', { count: 'exact', head: true })
      .lt('ultimo_acceso', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    
    usuariosInactivos.value = inactivos || 0

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
          password_hash: 'unefa-user', // Se debe implementar lógica de hash
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
    showDeleteSuccessModal.value = true
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
    showDeleteSuccessModal.value = true
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

onMounted(() => {
  if (!isAuthenticated()) {
    navigateTo('/')
  }
})

const handleLogout = () => {
  logout()
}

// Carga inicial
onMounted(() => {
  cargarUsuarios()
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

/* Estilos mejorados para el grid de estadísticas */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

/* Estilos para acciones rápidas - Versión mejorada */
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
  padding: 0.75rem 1rem;
  white-space: nowrap;
  transition: all 0.3s ease;
}

.quick-actions .btn i {
  margin-right: 8px;
}

/* Estilos para la tabla responsive */
.table-responsive {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

/* Media queries para responsive design - Versión mejorada */
@media (max-width: 1199.98px) {
  .admin-content {
    padding: 1.25rem;
  }
  
  .stats-grid {
    gap: 1.25rem;
  }
  
  .quick-actions .btn {
    min-width: 160px;
    padding: 0.65rem 0.9rem;
    font-size: 0.95rem;
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
  
  .card-header h5 {
    font-size: 1.1rem;
  }
  
  .quick-actions {
    gap: 0.5rem;
  }
  
  .quick-actions .btn {
    min-width: 140px;
    font-size: 0.9rem;
  }
}

@media (max-width: 767.98px) {
  .admin-content {
    padding: 0.75rem;
  }
  
  .stats-grid {
    gap: 1rem;
  }
  
  .card-header {
    padding: 0.85rem 1.25rem;
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
  .admin-content {
    padding: 0.5rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .card-header {
    padding: 0.75rem 1rem;
  }
  
  .card-header h5 {
    font-size: 1rem;
  }
  
  .card-header h5 i {
    margin-right: 0.5rem;
  }
  
  .quick-actions .btn {
    padding: 0.6rem;
    font-size: 0.85rem;
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
    margin-right: 0.4rem;
    font-size: 0.9em;
  }
}

/* Estilos específicos para columnas de la tabla */
.select-col {
  width: 40px;
  text-align: center;
}

.name-col {
  min-width: 150px;
}

.email-col, .alt-email-col {
  min-width: 180px;
}

.date-col {
  min-width: 120px;
}

.actions-col {
  width: 120px;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
}

/* Estilos para los modales */
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

.modal-dialog-centered {
  display: flex;
  align-items: center;
  min-height: calc(100% - 1rem);
}
</style>