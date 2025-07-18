<template>
  <ClientOnly>
    <nav class="bottom-nav">
      <NuxtLink to="/panel" class="nav-item" active-class="active">
        <i class="bi bi-grid"></i>
        <span>Panel</span>
      </NuxtLink>
      <NuxtLink to="/dashboard" class="nav-item" active-class="active">
        <i class="bi bi-grid"></i>
        <span>Simuladores</span>
      </NuxtLink>

      <NuxtLink to="/usuarios" class="nav-item" active-class="active">
        <i class="bi bi-people"></i>
        <span>Usuarios</span>
      </NuxtLink>

      <div class="nav-item" @click="logout">
        <i class="bi bi-box-arrow-right text-danger"></i>
        <span class="text-danger">Salir</span>
      </div>
    </nav>
  </ClientOnly>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()

async function logout() {
  const { $supabase } = useNuxtApp()
  await $supabase?.auth.signOut?.()
  router.push('/')
}
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background-color: #002147;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 2px solid #ffc72c;
  z-index: 1200;
  padding: 0 4px;
  gap: 0;
}

.nav-item {
  flex: 1 1 0;
  min-width: 0;
  text-align: center;
  color: #fff;
  text-decoration: none;
  font-size: 13px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
  padding: 0 2px;
  cursor: pointer;
}

.nav-item i {
  font-size: 20px;
  margin-bottom: 2px;
}

.nav-item span {
  font-size: 10px;
  margin-top: 0;
  line-height: 1.1;
  max-width: 80px;
  overflow-wrap: break-word;
  display: block;
  white-space: normal;
  word-break: break-word;
}

.nav-item.active,
.nav-item:hover,
.nav-item:focus {
  color: #ffc72c;
}

.text-danger {
  color: #ff5252 !important;
}

@media (max-width: 400px) {
  .nav-item span {
    font-size: 9px;
    max-width: 48px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

@media (min-width: 992px) {
  .bottom-nav {
    display: none !important;
  }
}
</style>
