<template>
  <div class="dashboard-container">
    <AdminSidebar @logout="handleLogout" />

    <main class="dashboard-main">
      <h2 class="mb-4 text-unefa-primary">Panel de Control</h2>

      <div class="stats-grid mb-4 wid">
        <StatsCard :value="totalSimuladores" label="Simuladores" icon="bi-cpu" color="primary" />
        <StatsCard :value="totalAsignaturas" label="Asignaturas" icon="bi-book" color="success" />
        <StatsCard :value="totalUsuarios" label="Usuarios" icon="bi-people" color="info" />
        <StatsCard :value="totalImagenes" label="Recursos visuales" icon="bi-images" color="warning" />
        <StatsCard :value="totalDescargas" label="Aplicaciones" icon="bi-download" color="danger" />
      </div>

      <div class="charts-grid mb-5 wid">
        <div class="chart-card">
          <h5>Simuladores por Asignatura</h5>
          <div class="canvas-wrapper">
            <canvas id="chartAsignaturas"></canvas>
          </div>
        </div>

        <div class="chart-card">
          <h5>Usuarios registrados (últimos 7 días)</h5>
          <div class="canvas-wrapper">
            <canvas id="chartUsuarios"></canvas>
          </div>
        </div>
      </div>

      <section class="recent-actions">
        <h3>Usuarios registrados últimos 7 días</h3>
        <div class="recent-card">
          <table class="recent-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in usuariosUltimos7Dias" :key="user.id">
                <td>{{ user.nombre }}</td>
                <td>{{ user.apellido }}</td>
                <td>{{ formatFecha(user.creado_en) }}</td>
              </tr>
              <tr v-if="usuariosUltimos7Dias.length === 0">
                <td colspan="3" class="text-center">No hay registros recientes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="export-section">
        <button class="btn btn-primary" @click="exportarJSON">Exportar simuladores (JSON)</button>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import type { SupabaseClient } from '@supabase/supabase-js'
import Chart from 'chart.js/auto'

import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import StatsCard from '@/components/admin/StatsCard.vue'

const router = useRouter()
const { $supabase } = useNuxtApp()
const supabase = $supabase as SupabaseClient

const totalSimuladores = ref(0)
const totalAsignaturas = ref(0)
const totalCategorias = ref(0)
const totalUsuarios = ref(0)
const totalImagenes = ref(0)
const totalDescargas = ref(0)

const usuariosUltimos7Dias = ref([])
const simuladores = ref([])

let chartAsignaturas: Chart | null = null
let chartUsuarios: Chart | null = null

function renderUsuariosChart(canvasId: string, labels: string[], data: number[], existingChart: Chart | null) {
  const ctx = (document.getElementById(canvasId) as HTMLCanvasElement)?.getContext('2d')
  if (!ctx) return existingChart

  if (existingChart) existingChart.destroy()

  // Crear un gradiente para el fondo del área del gráfico
  const gradient = ctx.createLinearGradient(0, 0, 0, 300)
  gradient.addColorStop(0, 'rgba(13, 110, 253, 0.5)')
  gradient.addColorStop(1, 'rgba(13, 110, 253, 0)')

  const config = {
    type: 'line',
    data: {
      labels,
      datasets: [{
          label: 'Nuevos Usuarios',
          data,
          backgroundColor: gradient,
          borderColor: 'rgba(13, 110, 253, 1)',
          pointBackgroundColor: 'rgba(13, 110, 253, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(13, 110, 253, 1)',
          fill: true,
          tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: '#002147',
          titleColor: '#FFC72C',
          bodyColor: '#fff',
          padding: 10,
          cornerRadius: 4
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: '#e9ecef' },
          ticks: { precision: 0 }
        },
        x: { grid: { display: false } }
      },
      interaction: { mode: 'index', intersect: false }
    }
  }

  return new Chart(ctx, config)
}

function renderAsignaturasChart(canvasId: string, labels: string[], data: number[], existingChart: Chart | null) {
  const ctx = (document.getElementById(canvasId) as HTMLCanvasElement)?.getContext('2d')
  if (!ctx) return existingChart

  if (existingChart) existingChart.destroy()

  const colors = [
    'rgba(13, 110, 253, 0.7)', 'rgba(25, 135, 84, 0.7)', 'rgba(255, 193, 7, 0.7)',
    'rgba(13, 202, 240, 0.7)', 'rgba(220, 53, 69, 0.7)', 'rgba(108, 117, 125, 0.7)'
  ]

  const config = {
    type: 'bar',
    data: {
      labels,
      datasets: [{
          label: 'Simuladores por Asignatura',
          data,
          backgroundColor: colors,
          borderColor: colors.map(c => c.replace(/0\.7\)$/, '1)')),
          borderWidth: 1,
          borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
    }
  }
  return new Chart(ctx, config)
}

async function cargarDatos() {
  try {
    const { data: simuladoresData, error: errSim } = await supabase.from('simuladores').select('*')
    if (errSim) throw errSim
    simuladores.value = simuladoresData || []
    totalSimuladores.value = simuladores.value.length

    const asignaturasSet = new Set(simuladores.value.map(s => s.asignatura))
    const categoriasSet = new Set(simuladores.value.map(s => s.categoria))
    totalAsignaturas.value = asignaturasSet.size
    totalCategorias.value = categoriasSet.size

    const { count } = await supabase.from('usuarios').select('*', { count: 'exact', head: true })
    totalUsuarios.value = count || 0

    // Obtener total de imágenes de la biblioteca
    const { data: imageFiles, error: errImg } = await supabase.storage.from('biblioteca').list('', { limit: 10000 })
    if (errImg) throw errImg
    totalImagenes.value = imageFiles?.length || 0

    // Obtener total de descargas (asumiendo que la tabla se llama 'descargas')
    const { count: descargasCount, error: errDescargas } = await supabase.from('descargas').select('*', { count: 'exact', head: true })
    if (errDescargas) throw errDescargas
    totalDescargas.value = descargasCount || 0

    const fecha7Dias = new Date()
    fecha7Dias.setDate(fecha7Dias.getDate() - 7)
    const { data: usuariosRecientes } = await supabase
      .from('usuarios')
      .select('id, nombre, apellido, creado_en')
      .gte('creado_en', fecha7Dias.toISOString())
      .order('creado_en', { ascending: false })
    usuariosUltimos7Dias.value = usuariosRecientes || []

    await nextTick()

    const asignaturaCount: Record<string, number> = {}
    simuladores.value.forEach(s => {
      asignaturaCount[s.asignatura] = (asignaturaCount[s.asignatura] || 0) + 1
    })
    chartAsignaturas = renderAsignaturasChart(
      'chartAsignaturas',
      Object.keys(asignaturaCount),
      Object.values(asignaturaCount),
      chartAsignaturas
    )

    // Lógica de usuarios por día con zona horaria de Venezuela
    const usuariosPorDia: { [key: string]: number } = {}
    const diasLabels: string[] = []
    const hoy = new Date()
    const timeZone = 'America/Caracas'

    // Inicializar los últimos 7 días
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date(hoy)
      fecha.setDate(hoy.getDate() - i)
      const key = fecha.toLocaleDateString('es-VE', { timeZone })
      usuariosPorDia[key] = 0
      diasLabels.push(
        fecha.toLocaleDateString('es-VE', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          timeZone
        })
      )
    }

    // Agrupar usuarios por fecha de registro en la zona horaria correcta
    usuariosUltimos7Dias.value.forEach((u: any) => {
      const fechaRegistro = new Date(u.creado_en)
      const key = fechaRegistro.toLocaleDateString('es-VE', { timeZone })
      if (usuariosPorDia[key] !== undefined) {
        usuariosPorDia[key]++
      }
    })

    chartUsuarios = renderUsuariosChart(
      'chartUsuarios',
      diasLabels,
      Object.values(usuariosPorDia),
      chartUsuarios
    )
  } catch (error) {
    console.error('Error cargando datos:', error)
  }
}

function handleLogout() {
  router.push('/')
}

function formatFecha(fechaStr: string | null | undefined) {
  if (!fechaStr) return null
  const date = new Date(fechaStr)
  return date.toLocaleDateString('es-VE', { year: 'numeric', month: 'short', day: 'numeric' })
}

function exportarJSON() {
  if (!simuladores.value.length) {
    alert('No hay datos para exportar.')
    return
  }
  const jsonStr = JSON.stringify(simuladores.value, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'simuladores.json'
  a.click()
  URL.revokeObjectURL(url)
}

onMounted(() => {
  cargarDatos()
})
</script>

<style scoped>
.dashboard-container {
  display: flex;
  margin-left: 250px;
  min-height: 100vh;
}
.dashboard-main {
  flex: 1;
  padding: 2rem;
  background-color: #f8f9fa;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1rem;
}
.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}
.chart-card {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  height: 100%;
}
.canvas-wrapper {
  flex: 1;
  position: relative;
  width: 100%;
  min-height: 300px;
}
canvas {
  position: absolute;
  top: 0; left: 0;
  width: 100% !important;
  height: 100% !important;
  display: block;
}
.recent-card {
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fafafa;
  max-height: 400px; /* Altura máxima para la tabla */
  overflow: auto;     /* Scroll vertical y horizontal si es necesario */
}
.recent-table {
  width: 100%;
  border-collapse: collapse;
}
.recent-table th, .recent-table td {
  text-align: left;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid #ddd;
}
.recent-table th {
  background-color: #e9ecef;
  color: #333;
  position: sticky;
  top: 0;
  z-index: 1; /* Asegura que la cabecera esté por encima */
  box-shadow: inset 0 -2px 0 #ddd; /* Separador visual */
}
.text-center {
  text-align: center;
  padding: 1rem;
  color: #666;
}
.export-section {
  margin: 2rem 0;
}
button.btn {
  cursor: pointer;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background-color: #0d6efd;
  color: white;
}
button.btn:hover {
  background-color: #084cd9;
}

@media (max-width: 1000px) {
  .dashboard-container {
    margin-left: 0;
  }
}
@media (max-width: 767px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
  .canvas-wrapper {
    min-height: 250px;
  }
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 575px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
