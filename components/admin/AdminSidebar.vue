<template>
  <div class="admin-sidebar">
    <div class="sidebar-header">
      <h4 class="text-unefa-primary ">
        <i class="bi bi-speedometer2 me-2"></i>
        <span>MachinaLabFinder Admin</span>
      </h4>
    </div>
    <ul class="nav flex-column">
      <li class="nav-item">
        <NuxtLink to="/dashboard" class="nav-link">
          <i class="bi bi-grid"></i> Simuladores
        </NuxtLink >
      </li>
      <li class="nav-item">
        <NuxtLink to="/usuarios" class="nav-link">
          <i class="bi bi-people"></i> Usuarios
        </NuxtLink >
      </li>
      <li class="nav-item">
        <button class="nav-link text-danger" @click="$emit('logout')">
          <i class="bi bi-box-arrow-right"></i> Cerrar Sesión
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
defineEmits(['logout'])
</script>

<style scoped>
.admin-sidebar {
  width: 250px;
  background-color: #f8f9fa;
  border-right: 1px solid #dee2e6;
  padding: 1rem;
  position: fixed;
  height: 100vh;
}

.sidebar-header {
  padding: 1rem 0.5rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid #dee2e6;
}

.nav-link {
  color: #495057;
  border-radius: 4px;
  margin-bottom: 0.25rem;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.router-link-exact-active {
  background-color: #007a3d;
  color: white;
}

.nav-link:hover:not(.router-link-exact-active) {
  background-color: #e9ecef;
}

@media (max-width: 991.98px) {
  .admin-sidebar {
    display: none;
  }
}
.admin-sidebar {
  width: 250px;
  background-color: #f8f9fa;
  border-right: 1px solid #dee2e6;
  padding: 1rem;
  height: 100vh;
}

@media (min-width: 992px) {
  .admin-sidebar {
    position: fixed;
    top: 0;
    left: 0;
  }
}

@media (max-width: 991.98px) {
  .admin-sidebar {
    display: none;
  }
}


</style>