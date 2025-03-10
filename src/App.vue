<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <nav>
    <RouterLink class="link" :to="{ name: 'HomeView' }">Home</RouterLink>
  </nav>

  <RouterView />
</template>

<style lang="css" scoped>
nav {
  margin-bottom: 2em;
}

.link {
  font-size: 1.5em;
  color: #fff;
}
</style>
