<template>
  <div class="admin-dashboard">
    <AdminSidebar @logout="handleLogout" />
    
    <div class="admin-content">
      <h2 class="mb-4 text-unefa-primary">Panel de Descargas</h2>
      
      <!-- Sistema de alertas mejorado -->
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

      <!-- Resumen estadístico -->
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="bi bi-download"></i>
            </div>
            <div class="stat-info">
              <h3>{{ totalDescargas }}</h3>
              <p>Programas</p>
            </div>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="bi bi-book"></i>
            </div>
            <div class="stat-info">
              <h3>{{ totalAsignaturas }}</h3>
              <p>Asignaturas</p>
            </div>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="bi bi-windows"></i>
            </div>
            <div class="stat-info">
              <h3>{{ totalSistemasOperativos }}</h3>
              <p>Sistemas Operativos</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Acciones rápidas -->
      <div class="card mb-4">
        <div class="card-header bg-unefa-primary text-white">
          <h5 class="mb-0">
            <i class="bi bi-lightning-charge me-2"></i>Acciones Rápidas
          </h5>
        </div>
        <div class="card-body">
          <div class="quick-actions">
            <button class="btn btn-unefa-primary" @click="abrirNuevaDescarga">
              <i class="bi bi-plus-circle me-2"></i>Nuevo Programa
            </button>
            <button class="btn btn-outline-success" @click="exportarDatos">
              <i class="bi bi-download me-2"></i>Exportar Datos
            </button>
          </div>
        </div>
      </div>

      <!-- Tabla de descargas -->
      <div class="card">
        <div class="card-header bg-unefa-primary text-white">
          <h5 class="mb-0">
            <i class="bi bi-download me-2"></i>Listado de Programas
          </h5>
        </div>
        <div class="card-body tablex">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Asignatura</th>
                  <th>Sistema</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="descarga in descargas" :key="descarga.id">
                  <td>
                    <div class="fw-bold">{{ descarga.nombre_del_programa }}</div>
                    <div class="text-muted small">{{ truncateText(descarga.descripcion_del_programa, 50) }}</div>
                  </td>
                  <td>{{ descarga.asignatura }}</td>
                  <td>
                    <span class="badge bg-info" v-if="descarga.sistema_operativo">
                      {{ descarga.sistema_operativo }}
                    </span>
                    <span class="text-muted small" v-else>No especificado</span>
                  </td>
                  <td>
                    <div class="d-flex gap-2">
                      <button class="btn btn-sm btn-outline-primary" @click="abrirEditarDescarga(descarga)">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger" @click="abrirEliminarDescarga(descarga)">
                        <i class="bi bi-trash"></i>
                      </button>
                      <a v-if="descarga.enlace_del_programa" 
                        :href="descarga.enlace_del_programa" 
                        target="_blank" 
                        class="btn btn-sm btn-outline-success">
                        <i class="bi bi-download"></i>
                      </a>
                    </div>
                  </td>
                </tr>
                <tr v-if="descargas.length === 0">
                  <td colspan="5" class="text-center text-muted py-4">
                    No hay programas registrados
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Modal de formulario -->
      <div class="modal-overlay" v-if="modalDescargaVisible" @click.self="cerrarModales">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi" :class="modoEdicion ? 'bi-pencil' : 'bi-plus-circle'"></i>
              {{ modoEdicion ? 'Editar Programa' : 'Nuevo Programa' }}
            </h5>
            <button type="button" class="btn-close" @click="cerrarModales"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="guardarDescarga">
              <div class="mb-3">
                <label for="nombre" class="form-label">Nombre del Programa</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="nombre" 
                  v-model="formData.nombre" 
                  required
                >
              </div>
              
              <div class="mb-3">
                <label for="descripcion" class="form-label">Descripción</label>
                <textarea 
                  class="form-control" 
                  id="descripcion" 
                  rows="3" 
                  v-model="formData.descripcion"
                ></textarea>
              </div>
              
              <div class="mb-3">
                <label for="asignatura" class="form-label">Asignatura</label>
                <select 
                  class="form-select" 
                  id="asignatura" 
                  v-model="formData.asignatura" 
                  required
                >
                  <option value="" disabled>Seleccione una asignatura</option>
                  <option v-for="asignatura in asignaturasOpciones" :key="asignatura" :value="asignatura">
                    {{ asignatura }}
                  </option>
                </select>
              </div>
              
              <div class="mb-3">
                <label for="enlace" class="form-label">Enlace de Descarga</label>
                <input 
                  type="url" 
                  class="form-control" 
                  id="enlace" 
                  v-model="formData.enlace" 
                  placeholder="https://ejemplo.com/descarga"
                >
              </div>
              
              <div class="mb-3">
                <label for="sistema" class="form-label">Sistema Operativo</label>
                <select 
                  class="form-select" 
                  id="sistema" 
                  v-model="formData.sistema_operativo"
                >
                  <option value="" disabled>No especificado</option>
                  <option v-for="sistema in sistemasOperativosOpciones" :key="sistema" :value="sistema">
                    {{ sistema }}
                  </option>
                </select>
              </div>
              
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" @click="cerrarModales">Cancelar</button>
                <button type="submit" class="btn btn-unefa-primary">
                  {{ modoEdicion ? 'Actualizar' : 'Guardar' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Modal de confirmación de eliminación -->
      <div class="modal-overlay" v-if="modalEliminarVisible" @click.self="cerrarModales">
        <div class="modal-content" style="max-width: 500px;">
          <div class="modal-header">
            <h5 class="modal-title text-danger">
              <i class="bi bi-exclamation-triangle me-2"></i>
              Confirmar Eliminación
            </h5>
            <button type="button" class="btn-close" @click="cerrarModales"></button>
          </div>
          <div class="modal-body">
            <p>¿Estás seguro que deseas eliminar el programa <strong>{{ descargaSeleccionada?.nombre_del_programa || '' }}</strong>?</p>
            <p class="text-muted small">Esta acción no se puede deshacer.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="cerrarModales">Cancelar</button>
            <button type="button" class="btn btn-danger" @click="confirmarEliminar">
              <i class="bi bi-trash me-2"></i>Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { SupabaseClient } from '@supabase/supabase-js'

// Configuración inicial
const { isAuthenticated, logout } = useAuth()
const router = useRouter()
const { $supabase } = useNuxtApp()
const supabase = $supabase as SupabaseClient

// Datos y estado
const descargas = ref<any[]>([])
const totalDescargas = ref(0)
const totalAsignaturas = ref(0)
const totalSistemasOperativos = ref(0)

// Sistema de alertas mejorado
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

// Opciones para formulario
const asignaturasOpciones = [
  "Matemáticas", "Química", "Física I", "Cálculo Numérico", "Probabilidad y Estadística", 
  "Lógica Matemática", "Circuitos Lógicos", "Investigación de Operaciones", 
  "Arquitectura del Computador", "Optimización No Lineal", "Procesos Estocásticos", 
  "Geometría Analítica", "Física II", "Programación", "Lenguajes de Programación I",
  "Lenguajes de Programación II", "Lenguajes de Programación III", "Procesamiento de Datos", 
  "Bases de Datos", "Redes", "Sistemas Operativos", "Simulación y Modelos"
]

const sistemasOperativosOpciones = [
  "Windows", "Linux", "macOS", "Multiplataforma", "Android", "iOS", "Web"
]

// Estado de modales
const modalDescargaVisible = ref(false)
const modalEliminarVisible = ref(false)
const descargaSeleccionada = ref<any>(null)
const modoEdicion = ref(false)

// Datos del formulario
const formData = ref({
  nombre: '',
  descripcion: '',
  asignatura: '',
  enlace: '',
  sistema_operativo: ''
})

// Funciones de utilidad
function truncateText(text: string, length: number) {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

function escapeCsvField(field: any): string {
  const stringField = String(field === null || field === undefined ? '' : field)
  if (stringField.search(/("|,|\n)/g) >= 0) {
    return `"${stringField.replace(/"/g, '""')}"`
  }
  return stringField
}

// Funciones de carga de datos
async function cargarDescargas() {
  try {
    const { data, error } = await supabase
      .from('descargas')
      .select('*')
      .order('id', { ascending: false })
    
    if (error) throw error
    
    descargas.value = data || []
    totalDescargas.value = data?.length || 0
    
    // Calcular estadísticas
    const asignaturas = new Set(data?.map(item => item.asignatura))
    const sistemas = new Set(data?.map(item => item.sistema_operativo).filter(Boolean))
    
    totalAsignaturas.value = asignaturas.size
    totalSistemasOperativos.value = sistemas.size
    
  } catch (error) {
    console.error('Error al cargar descargas:', error)
    addAlert('error', 'Error al cargar los datos de descargas. Por favor, intente nuevamente.')
  }
}

// Manejo de modales
function abrirNuevaDescarga() {
  modoEdicion.value = false
  descargaSeleccionada.value = null
  resetForm()
  modalDescargaVisible.value = true
}

function abrirEditarDescarga(descarga: any) {
  modoEdicion.value = true
  descargaSeleccionada.value = descarga
  formData.value = {
    nombre: descarga.nombre_del_programa || '',
    descripcion: descarga.descripcion_del_programa || '',
    asignatura: descarga.asignatura || '',
    enlace: descarga.enlace_del_programa || '',
    sistema_operativo: descarga.sistema_operativo || ''
  }
  modalDescargaVisible.value = true
}

function abrirEliminarDescarga(descarga: any) {
  descargaSeleccionada.value = descarga
  modalEliminarVisible.value = true
}

function cerrarModales() {
  modalDescargaVisible.value = false
  modalEliminarVisible.value = false
  descargaSeleccionada.value = null
}

function resetForm() {
  formData.value = {
    nombre: '',
    descripcion: '',
    asignatura: '',
    enlace: '',
    sistema_operativo: ''
  }
}

// Operaciones CRUD
async function guardarDescarga() {
  try {
    if (modoEdicion.value && descargaSeleccionada.value) {
      // Actualización
      const { error } = await supabase
        .from('descargas')
        .update({
          nombre_del_programa: formData.value.nombre,
          descripcion_del_programa: formData.value.descripcion,
          asignatura: formData.value.asignatura,
          enlace_del_programa: formData.value.enlace,
          sistema_operativo: formData.value.sistema_operativo
        })
        .eq('id', descargaSeleccionada.value.id)

      if (error) throw error
      
      addAlert('success', 'Programa actualizado correctamente')
    } else {
      // Creación
      const { data, error } = await supabase
        .from('descargas')
        .insert([{
          nombre_del_programa: formData.value.nombre,
          descripcion_del_programa: formData.value.descripcion,
          asignatura: formData.value.asignatura,
          enlace_del_programa: formData.value.enlace,
          sistema_operativo: formData.value.sistema_operativo
        }])
        .select()

      if (error) throw error
      
      addAlert('success', 'Programa creado correctamente')
    }

    await cargarDescargas()
    cerrarModales()
  } catch (error) {
    console.error('Error al guardar descarga:', error)
    const message = modoEdicion.value 
      ? 'Error al actualizar el programa. Verifique los datos e intente nuevamente.' 
      : 'Error al crear el programa. Verifique los datos e intente nuevamente.'
    addAlert('error', message)
  }
}

async function confirmarEliminar() {
  if (!descargaSeleccionada.value) return

  try {
    const { error } = await supabase
      .from('descargas')
      .delete()
      .eq('id', descargaSeleccionada.value.id)

    if (error) throw error

    await cargarDescargas()
    cerrarModales()
    addAlert('success', 'Programa eliminado correctamente')
  } catch (error) {
    console.error('Error al eliminar programa:', error)
    addAlert('error', 'Error al eliminar el programa. Por favor, intente nuevamente.')
  }
}

async function exportarDatos() {
  try {
    if (descargas.value.length === 0) {
      addAlert('warning', 'No hay datos de programas para exportar.')
      return
    }

    const headers = ['ID', 'Nombre', 'Descripción', 'Asignatura', 'Enlace', 'Sistema Operativo']
    const rows = descargas.value.map(item => [
      item.id, 
      item.nombre_del_programa, 
      item.descripcion_del_programa, 
      item.asignatura, 
      item.enlace_del_programa, 
      item.sistema_operativo
    ])

    let csvContent = "data:text/csv;charset=utf-8," + headers.map(escapeCsvField).join(',') + '\r\n'
    rows.forEach(rowArray => {
      csvContent += rowArray.map(escapeCsvField).join(',') + '\r\n'
    })

    const link = document.createElement("a")
    link.setAttribute("href", encodeURI(csvContent))
    link.setAttribute("download", `programas_descarga_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    addAlert('success', 'Exportación completada correctamente')
  } catch (error) {
    console.error('Error al exportar datos:', error)
    addAlert('error', 'Error al exportar los datos. Por favor, intente nuevamente.')
  }
}

// Autenticación
const handleLogout = () => {
  logout()
}

// Carga inicial
onMounted(() => {
  if (!isAuthenticated()) {
    navigateTo('/')
  }
  cargarDescargas()
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

/* Estadísticas */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  min-width: 0;
}

.stat-card {
  background-color: #002147;
  color: #FFC72C;
  border-radius: 10px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 2rem;
  margin-right: 1rem;
}

.stat-info h3 {
  font-size: 1.75rem;
  margin: 0;
  font-weight: 700;
}

.stat-info p {
  margin: 0;
  opacity: 0.9;
  font-size: 0.9rem;
}

/* Tabla */
.table-responsive {
  overflow-x: auto;
}
.tablex{
  height: 500px !important; 
  max-height: 500px !important;
  overflow-y: scroll !important;
}
.table {
  font-size: 0.9rem;
  width: 100%;
}

.table th {
  font-weight: 600;
  color: #495057;
  background-color: #f8f9fa;
  padding: 0.75rem 1rem;
}

.table td {
  padding: 0.75rem 1rem;
  vertical-align: middle;
}

.badge {
  font-size: 0.75em;
  font-weight: 500;
  padding: 0.35em 0.65em;
}

/* Acciones rápidas */
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

/* Modales */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}

.modal-content {
  background-color: white;
  border-radius: 10px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #dee2e6;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.btn-close:hover {
  opacity: 1;
}

/* Responsive */
@media (max-width: 1199.98px) {
  .admin-content {
    padding: 1.25rem;
  }
  
  .stats-grid {
    gap: 1rem;
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
  
  .quick-actions .btn {
    min-width: 160px;
  }
  
  .alert-container {
    max-width: 300px;
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
    margin-right: 0.5rem;
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .stat-icon {
    font-size: 1.5rem;
  }
  
  .stat-info h3 {
    font-size: 1.5rem;
  }
  
  .alert-container {
    max-width: 220px;
  }
}
</style>