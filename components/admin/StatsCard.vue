<template>
  <div class="stat-card">
    <div class="stat-icon">
      <i class="bi" :class="icon"></i>
    </div>
    <div class="stat-info">
      <h5>{{ value }}</h5>
      <span>{{ label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  value: {
    type: [Number, String],
    required: true
  },
  label: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: 'primary'
  },
  textClass: {
    type: String,
    default: 'text-white'
  }
})
</script>

<style scoped>
.stat-card {
  background-color: #002147;
  color: #FFC72C;
  display: flex;
  align-items: center;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 2rem;
  margin-right: 1rem;
}

.stat-info h5 {
  font-size: 1.75rem;
  margin-bottom: 0.25rem;
}

.stat-info span {
  font-size: 0.9rem;
  opacity: 0.9;
}
</style>