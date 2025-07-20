<template>
  <div class="admin-dashboard">
    <AdminSidebar @logout="handleLogout" />
    
    <div class="admin-content">
      <h2 class="mb-4 text-unefa-primary">Panel de Usuarios</h2>
      
      <!-- Alertas de error/success -->
      <div class="alert-container">
        <transition-group name="alert">
          <div 
            v-for="(alert, index) in activeAlerts" 
            :key="alert.id"
            class="alert"
            :class="`alert-${alert.type}`"
          >
            <div class="alert-content">
              <i :class="alert.icon"></i>
              <span>{{ alert.message }}</span>
              <button class="alert-close" @click="removeAlert(index)">
                <i class="bi bi-x"></i>
              </button>
            </div>
          </div>
        </transition-group>
      </div>

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
        <div class="card-body ">
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

      <!-- Backdrop para todos los modales -->
      <div class="modal-backdrop fade show" v-if="modalUsuarioVisible || modalEliminarVisible || modalEliminacionMasivaVisible"></div>
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
const usuarioSeleccionado = ref<any>(null)
const modoEdicion = ref(false)

// Sistema de alertas
interface Alert {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  icon: string;
  timeout?: number;
}

const alerts = ref<Alert[]>([])
let alertIdCounter = 0

const activeAlerts = computed(() => alerts.value)

function addAlert(type: Alert['type'], message: string, timeout = 5000) {
  const icons = {
    success: 'bi bi-check-circle-fill',
    error: 'bi bi-exclamation-circle-fill',
    warning: 'bi bi-exclamation-triangle-fill',
    info: 'bi bi-info-circle-fill'
  }
  
  const newAlert: Alert = {
    id: alertIdCounter++,
    type,
    message,
    icon: icons[type],
    timeout
  }
  
  alerts.value.push(newAlert)
  
  if (timeout > 0) {
    setTimeout(() => {
      removeAlertById(newAlert.id)
    }, timeout)
  }
}

function removeAlert(index: number) {
  alerts.value.splice(index, 1)
}

function removeAlertById(id: number) {
  const index = alerts.value.findIndex(alert => alert.id === id)
  if (index !== -1) {
    alerts.value.splice(index, 1)
  }
}

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
    addAlert('error', 'Error al cargar los usuarios. Por favor, intente nuevamente.')
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
    // --- Validación de Correo Electrónico Duplicado ---
    const { data: existingUser, error: checkError } = await supabase
      .from('usuarios')
      .select('id, email')
      .eq('email', formData.email)
      .limit(1)
      .single()

    // Ignoramos el error 'PGRST116' que significa "no se encontró la fila", lo cual es bueno en este caso.
    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError
    }

    // Si se encontró un usuario con ese correo
    if (existingUser) {
      // En modo creación, o en modo edición si el ID encontrado es diferente al del usuario actual
      if (!modoEdicion.value || (modoEdicion.value && existingUser.id !== usuarioSeleccionado.value.id)) {
        addAlert('error', `El correo electrónico '${formData.email}' ya está registrado. Por favor, utilice otra dirección.`)
        return // Detener la ejecución para no guardar el duplicado
      }
    }
    // --- Fin de la Validación ---

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
      
      addAlert('success', 'Usuario actualizado correctamente')
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
      
      addAlert('success', 'Usuario creado correctamente')
    }

    await cargarUsuarios()
    cerrarModales()
  } catch (error) {
    console.error('Error al guardar usuario:', error)
    const message = modoEdicion.value 
      ? 'Error al actualizar el usuario. Verifique los datos e intente nuevamente.' 
      : 'Error al crear el usuario. Verifique los datos e intente nuevamente.'
    addAlert('error', message)
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
    addAlert('success', 'Usuario eliminado correctamente')
  } catch (error) {
    console.error('Error al eliminar usuario:', error)
    addAlert('error', 'Error al eliminar el usuario. Por favor, intente nuevamente.')
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
    addAlert('success', `Se eliminaron ${usuariosSeleccionados.value.length} usuarios correctamente`)
  } catch (error) {
    console.error('Error al eliminar usuarios:', error)
    addAlert('error', 'Error al eliminar los usuarios seleccionados. Por favor, intente nuevamente.')
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
    
    addAlert('success', 'Exportación completada correctamente')
  } catch (error) {
    console.error('Error al exportar usuarios:', error)
    addAlert('error', 'Error al exportar los datos. Por favor, intente nuevamente.')
  }
}

// Utilidades
function formatFecha(fecha: string) {
  return new Date(fecha).toLocaleDateString('es-VE', {
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

/* Estilos para el sistema de alertas */
.alert-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1100;
  max-width: 400px;
  width: 100%;
}

.alert {
  position: relative;
  padding: 1rem 1.5rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  overflow: hidden;
  transition: all 0.3s ease;
  opacity: 1;
  transform: translateX(0);
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
  border-left: 4px solid #28a745;
}

.alert-error {
  background-color: #f8d7da;
  color: #721c24;
  border-left: 4px solid #dc3545;
}

.alert-warning {
  background-color: #fff3cd;
  color: #856404;
  border-left: 4px solid #ffc107;
}

.alert-info {
  background-color: #d1ecf1;
  color: #0c5460;
  border-left: 4px solid #17a2b8;
}

.alert-content {
  display: flex;
  align-items: center;
  width: 100%;
}

.alert i {
  margin-right: 12px;
  font-size: 1.25rem;
}

.alert-close {
  margin-left: auto;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0;
  font-size: 1.2rem;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.alert-close:hover {
  opacity: 1;
}

/* Transiciones para alertas */
.alert-enter-from,
.alert-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

.alert-enter-active,
.alert-leave-active {
  transition: all 0.3s ease;
}

.alert-move {
  transition: transform 0.3s ease;
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

/* Estilos para acciones rápidas*/
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
  max-height: 450px; /* O la altura que prefieras, ej: 50vh */
  overflow-y: auto;
}

/* Estilos para la cabecera fija (sticky header) */
.table thead th {
  position: -webkit-sticky; /* Para Safari */
  position: sticky;
  top: 0;
  z-index: 2; 
  background-color: #ffffff; 
  box-shadow: inset 0 -2px 0 #dee2e6; 
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
  
  .alert-container {
    max-width: 350px;
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
  
  .alert-container {
    max-width: 300px;
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
  
  .alert-container {
    max-width: 280px;
    top: 10px;
    right: 10px;
  }
  
  .alert {
    padding: 0.8rem 1.2rem;
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
  
  .alert-container {
    max-width: 250px;
  }
  
  .alert {
    padding: 0.7rem 1rem;
    font-size: 0.9rem;
  }
  
  .alert i {
    font-size: 1.1rem;
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
  
  .alert-container {
    max-width: 220px;
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