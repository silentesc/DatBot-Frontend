<script setup lang="ts">
import { RouterView } from 'vue-router'
import NavbarComponent from './components/NavbarComponent.vue';
</script>

<template>
  <NavbarComponent />

  <RouterView class="router-view" />
</template>

<style scoped>
.router-view {
  max-width: var(--max-width);
  margin: 0 auto;
}
</style>
