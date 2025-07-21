<template>
  <div class="admin-dashboard">
    <AdminSidebar @logout="handleLogout" />
    
    <div class="admin-content">
      <h2 class="mb-4 text-unefa-primary">Panel de Biblioteca</h2>
      
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
          <StatsCard 
            :value="totalImagenes" 
            label="Imágenes" 
            icon="bi-image" 
            color="primary" 
          />
        </div>
        <div class="stat-item">
          <StatsCard 
            :value="totalSize" 
            label="Espacio usado" 
            icon="bi-hdd" 
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
            <button class="btn btn-unefa-primary" @click="showUploadModal = true">
              <i class="bi bi-cloud-arrow-up me-2"></i>Subir Imágenes
            </button>
            <button class="btn btn-outline-secondary" @click="refreshImagenes">
              <i class="bi bi-arrow-clockwise me-2"></i>Actualizar
            </button>
          </div>
        </div>
      </div>

      <!-- Filtros y búsqueda -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row">
            <div class="col-md-12">
              <label for="searchInput" class="form-label">Buscar</label>
              <input 
                type="text" 
                class="form-control" 
                id="searchInput" 
                placeholder="Buscar por nombre..." 
                v-model="searchQuery"
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Galería de imágenes -->
      <div class="card" style="height: 500px;">
        <div class="card-header bg-unefa-primary text-white">
          <h5 class="mb-0">
            <i class="bi bi-images me-2"></i>Recursos de Biblioteca
          </h5>
        </div>
        <div class="card-body overflow-y-auto">
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-unefa-primary" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-2">Cargando imágenes...</p>
          </div>
          
          <div v-else-if="imagenesFiltradas.length === 0" class="text-center py-5">
            <i class="bi bi-folder-x" style="font-size: 3rem; color: #6c757d;"></i>
            <p class="mt-3">No se encontraron recursos</p>
          </div>
          
          <div v-else class="gallery-container">
            <div class="gallery-grid">
              <div 
                v-for="imagen in imagenesFiltradas" 
                :key="imagen.id" 
                class="gallery-item"
              >
                <div class="gallery-item-inner">
                  <img 
                    :src="imagen.url" 
                    :alt="imagen.nombre" 
                    class="gallery-image"
                    loading="lazy"
                  >
                  <div class="gallery-overlay">
                    <span class="gallery-name">{{ imagen.nombre }}</span>
                    <div class="gallery-actions">
                      <button 
                        class="btn btn-sm btn-outline-light me-2"
                        @click.stop="abrirModalRenombrar(imagen)"
                        title="Renombrar"
                      >
                        <i class="bi bi-pencil"></i>
                      </button>
                      
                      <button 
                        class="btn btn-sm btn-outline-danger"
                        @click.stop="confirmarEliminar(imagen)"
                        title="Eliminar"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal para subir imágenes -->
      <div v-if="showUploadModal" class="custom-modal">
        <div class="custom-modal-backdrop" @click="showUploadModal = false"></div>
        <div class="custom-modal-content modal-lg">
          <div class="custom-modal-header bg-unefa-primary text-white">
            <h5 class="custom-modal-title">
              <i class="bi bi-cloud-arrow-up me-2"></i>Subir Imágenes
            </h5>
            <button type="button" class="custom-modal-close" @click="showUploadModal = false">
              &times;
            </button>
          </div>
          <div class="custom-modal-body">
            <form @submit.prevent="subirImagenes">
              <div class="mb-3">
                <label class="form-label">Seleccionar imágenes</label>
                <input 
                  type="file" 
                  class="form-control" 
                  multiple 
                  accept="image/*" 
                  @change="handleFileSelect"
                  ref="fileInput"
                >
              </div>
              
              <div v-if="filesToUpload.length > 0" class="mb-4">
                <h6 class="mb-3">Previsualización</h6>
                <div class="upload-preview-container">
                  <div 
                    v-for="(file, index) in filesToUpload" 
                    :key="index" 
                    class="upload-preview-item"
                  >
                    <img :src="file.preview" class="upload-preview-image">
                    <div class="upload-preview-details">
                      <input 
                        type="text" 
                        class="form-control form-control-sm mb-2" 
                        v-model="file.customName"
                        :placeholder="file.originalName"
                      >
                      <div class="d-flex justify-content-between small">
                        <span>{{ file.type }}</span>
                        <span>{{ formatFileSize(file.size) }}</span>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      class="btn btn-sm btn-danger upload-remove-btn"
                      @click="removeFile(index)"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
              
              <div class="d-flex justify-content-end gap-2">
                <button 
                  type="button" 
                  class="btn btn-secondary" 
                  @click="showUploadModal = false"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  class="btn btn-unefa-primary"
                  :disabled="uploading || filesToUpload.length === 0"
                >
                  <span v-if="uploading">
                    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Subiendo...
                  </span>
                  <span v-else>
                    <i class="bi bi-cloud-arrow-up me-1"></i>Subir Imágenes
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Modal de confirmación de eliminación -->
      <div v-if="showDeleteModal" class="custom-modal">
        <div class="custom-modal-backdrop" @click="showDeleteModal = false"></div>
        <div class="custom-modal-content">
          <div class="custom-modal-header bg-danger text-white">
            <h5 class="custom-modal-title">
              <i class="bi bi-exclamation-triangle me-2"></i>Confirmar Eliminación
            </h5>
            <button type="button" class="custom-modal-close" @click="showDeleteModal = false">
              &times;
            </button>
          </div>
          <div class="custom-modal-body">
            <p>¿Estás seguro que deseas eliminar la imagen <strong>{{ imagenSeleccionada?.nombre }}</strong>?</p>
            <p class="text-danger">Esta acción no se puede deshacer.</p>
          </div>
          <div class="custom-modal-footer">
            <button type="button" class="btn btn-secondary" @click="showDeleteModal = false">Cancelar</button>
            <button 
              type="button" 
              class="btn btn-danger"
              @click="eliminarImagen"
              :disabled="deleting"
            >
              <span v-if="deleting">
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Eliminando...
              </span>
              <span v-else>
                <i class="bi bi-trash me-1"></i>Eliminar
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Modal para renombrar imagen -->
      <div v-if="showRenameModal" class="custom-modal">
        <div class="custom-modal-backdrop" @click="showRenameModal = false"></div>
        <div class="custom-modal-content">
          <div class="custom-modal-header bg-unefa-primary text-white">
            <h5 class="custom-modal-title">
              <i class="bi bi-pencil me-2"></i>Renombrar Imagen
            </h5>
            <button type="button" class="custom-modal-close" @click="showRenameModal = false">
              &times;
            </button>
          </div>
          <div class="custom-modal-body">
            <div class="mb-3">
              <label class="form-label">Nombre actual</label>
              <input type="text" class="form-control" :value="imagenSeleccionada?.nombre" disabled>
            </div>
            <div class="mb-3">
              <label class="form-label">Nuevo nombre (sin extensión)</label>
              <input 
                type="text" 
                class="form-control" 
                v-model="nuevoNombre" 
                :placeholder="imagenSeleccionada?.nombre.split('.')[0]"
              >
            </div>
          </div>
          <div class="custom-modal-footer">
            <button type="button" class="btn btn-secondary" @click="showRenameModal = false">Cancelar</button>
            <button 
              type="button" 
              class="btn btn-unefa-primary"
              @click="renombrarImagen"
              :disabled="renaming || !nuevoNombre"
            >
              <span v-if="renaming">
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Renombrando...
              </span>
              <span v-else>
                <i class="bi bi-save me-1"></i>Guardar Cambios
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { SupabaseClient } from '@supabase/supabase-js'

// Componentes
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import StatsCard from '@/components/admin/StatsCard.vue'
const { isAuthenticated, logout } = useAuth()
const router = useRouter()
const { $supabase } = useNuxtApp()
const supabase = $supabase as SupabaseClient

// Datos de imágenes
const imagenes = ref<any[]>([])
const loading = ref(true)
const totalImagenes = ref(0)
const totalSize = ref('0 MB')

// Filtros y búsqueda
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 12

// Estados para modales
const imagenSeleccionada = ref<any>(null)
const filesToUpload = ref<any[]>([])
const nuevoNombre = ref('')
const uploading = ref(false)
const deleting = ref(false)
const renaming = ref(false)
const showUploadModal = ref(false)
const showDeleteModal = ref(false)
const showRenameModal = ref(false)

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

// Computed properties
const imagenesFiltradas = computed(() => {
  let filtered = imagenes.value
  
  // Aplicar filtro de búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(img => 
      img.nombre.toLowerCase().includes(query)
    )
  }
  
  return filtered
})

const totalPages = computed(() => {
  return Math.ceil(imagenesFiltradas.value.length / itemsPerPage)
})

const paginatedImages = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return imagenesFiltradas.value.slice(start, end)
})

// Métodos
async function cargarImagenes() {
  try {
    loading.value = true
    const { data, error } = await supabase
      .storage
      .from('biblioteca')
      .list('', {
        limit: 1000,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      })
    
    if (error) throw error
    
    // Obtener URLs públicas para cada imagen
    const imagenesConUrl = await Promise.all(
      data.map(async (item) => {
        const { data: urlData } = supabase
          .storage
          .from('biblioteca')
          .getPublicUrl(item.name)
        
        return {
          id: item.id,
          nombre: item.name,
          url: urlData.publicUrl,
          metadata: {
            size: item.metadata?.size || 0,
            mimetype: item.metadata?.mimetype || 'image/*'
          }
        }
      })
    )
    
    imagenes.value = imagenesConUrl
    totalImagenes.value = imagenesConUrl.length
    
    // Calcular tamaño total
    const totalBytes = imagenesConUrl.reduce((sum, img) => sum + (img.metadata.size || 0), 0)
    totalSize.value = formatFileSize(totalBytes)
    
  } catch (error) {
    console.error('Error al cargar imágenes:', error)
    addAlert('error', 'Error al cargar las imágenes de la biblioteca')
  } finally {
    loading.value = false
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return
  
  filesToUpload.value = []
  
  Array.from(input.files).forEach(file => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "")
      
      filesToUpload.value.push({
        file,
        preview: e.target?.result,
        originalName: file.name,
        customName: fileNameWithoutExt,
        type: file.type.split('/')[1].toUpperCase(),
        size: file.size
      })
    }
    reader.readAsDataURL(file)
  })
}

function removeFile(index: number) {
  filesToUpload.value.splice(index, 1)
}

async function subirImagenes() {
  if (filesToUpload.value.length === 0) return;

  try {
    uploading.value = true;

    for (const item of filesToUpload.value) {
      // Sanitizar el nombre del archivo
      const safeName = item.customName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-.]/g, '');
      
      const fileExt = item.file.name.split('.').pop();
      const fileName = `${safeName}.${fileExt}`;

      // Verificar tipo MIME
      const mimeType = item.file.type || 'image/jpeg';
      if (!mimeType.startsWith('image/')) {
        throw new Error('Solo se permiten archivos de imagen');
      }

      // Subir el archivo con todos los parámetros necesarios
      const { error } = await supabase
        .storage
        .from('biblioteca')
        .upload(fileName, item.file, {
          cacheControl: '3600',
          contentType: mimeType,
          upsert: true,
          duplex: 'half'  
        });

      if (error) throw error;
    }

    // Éxito
    filesToUpload.value = [];
    showUploadModal.value = false;
    addAlert('success', 'Imágenes subidas correctamente');
    await cargarImagenes();

  } catch (error) {
    console.error('Error al subir imágenes:', error);
    addAlert('error', 'Error al subir las imágenes. Verifique los archivos e intente nuevamente.');
  } finally {
    uploading.value = false;
  }
}

function abrirModalRenombrar(imagen: any) {
  imagenSeleccionada.value = imagen;
  nuevoNombre.value = imagen.nombre.split('.')[0];
  showRenameModal.value = true;
}

async function renombrarImagen() {
  if (!imagenSeleccionada.value || !nuevoNombre.value) return;

  try {
    renaming.value = true;
    
    // Obtener la extensión del archivo original
    const nombreActual = imagenSeleccionada.value.nombre;
    const extension = nombreActual.split('.').pop();
    const nuevoNombreCompleto = `${nuevoNombre.value}.${extension}`;

    // Renombrar en Supabase (copiar y eliminar original)
    const { data: copyData, error: copyError } = await supabase
      .storage
      .from('biblioteca')
      .copy(nombreActual, nuevoNombreCompleto);

    if (copyError) throw copyError;

    // Eliminar el archivo original
    const { error: deleteError } = await supabase
      .storage
      .from('biblioteca')
      .remove([nombreActual]);

    if (deleteError) throw deleteError;

    // Actualizar la lista
    await cargarImagenes();
    showRenameModal.value = false;
    addAlert('success', 'Imagen renombrada correctamente');

  } catch (error) {
    console.error('Error al renombrar:', error);
    addAlert('error', 'Error al renombrar la imagen. Por favor, intente nuevamente.');
  } finally {
    renaming.value = false;
  }
}

function confirmarEliminar(imagen: any) {
  imagenSeleccionada.value = imagen;
  showDeleteModal.value = true;
}

async function eliminarImagen() {
  if (!imagenSeleccionada.value) return;
  
  try {
    deleting.value = true;
    
    const { error } = await supabase
      .storage
      .from('biblioteca')
      .remove([imagenSeleccionada.value.nombre]);
    
    if (error) throw error;
    
    // Recargar imágenes y mostrar confirmación
    await cargarImagenes();
    showDeleteModal.value = false;
    addAlert('success', 'Imagen eliminada correctamente');
    
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    addAlert('error', 'Error al eliminar la imagen. Por favor, intente nuevamente.');
  } finally {
    deleting.value = false;
  }
}

function refreshImagenes() {
  currentPage.value = 1;
  cargarImagenes();
}

function prevPage() {
  if (currentPage.value > 1) currentPage.value--;
}

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}

function goToPage(page: number) {
  currentPage.value = page;
}

const handleLogout = () => {
  logout();
}

// Inicialización
onMounted(() => {
  if (!isAuthenticated()) {
    navigateTo('/biblioteca');
  }
  
  // Cargar imágenes
  cargarImagenes();
});
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

/* Estilos para el grid de estadísticas */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  min-width: 0;
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

/* Galería de imágenes */
.gallery-container {
  width: 100%;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.gallery-item {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.gallery-item:hover {
  transform: translateY(-5px);
}

.gallery-item-inner {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  aspect-ratio: 1 / 1;
}

.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.gallery-item:hover .gallery-image {
  transform: scale(1.05);
}

.gallery-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  padding: 0.75rem;
  color: white;
  display: flex;
  flex-direction: column;
}

.gallery-name {
  display: block;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.5rem;
}

.gallery-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.gallery-actions .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

/* Previsualización de subida */
.upload-preview-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  max-height: 300px;
  overflow-y: auto;
  padding: 0.5rem;
}

.upload-preview-item {
  position: relative;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 0.5rem;
  background: white;
}

.upload-preview-image {
  width: 100%;
  height: 100px;
  object-fit: contain;
  margin-bottom: 0.5rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.upload-preview-details {
  padding: 0.25rem;
}

.upload-remove-btn {
  position: absolute;
  top: 0;
  right: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transform: translate(30%, -30%);
}

/* Estilos para modales personalizados */
.custom-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}

.custom-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1040;
}

.custom-modal-content {
  position: relative;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1050;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.custom-modal-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #dee2e6;
  border-radius: 8px 8px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.custom-modal-title {
  margin: 0;
  font-size: 1.25rem;
}

.custom-modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  color: white;
}

.custom-modal-body {
  padding: 1.5rem;
}

.custom-modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #dee2e6;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.modal-lg {
  width: 800px;
  max-width: 90%;
}

/* Media queries para responsive design */
@media (max-width: 1199.98px) {
  .admin-content {
    padding: 1.25rem;
  }
  
  .stats-grid {
    gap: 1rem;
  }
  
  .gallery-grid {
    gap: 1.25rem;
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
  
  .gallery-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
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
  
  .gallery-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
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
  
  .gallery-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.75rem;
  }
  
  .upload-preview-container {
    grid-template-columns: 1fr;
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
  
  .gallery-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .alert-container {
    max-width: 220px;
  }
}
</style>