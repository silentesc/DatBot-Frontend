<script setup lang="ts">
import { ref } from 'vue';
import { RouterView } from 'vue-router'
import NavbarComponent from './components/NavbarComponent.vue';
import type { Session } from './models';

const currentSession = ref<Session | null>(null);

const authenticated = (session: Session) => {
    currentSession.value = session;
}

const logout = () => {
    currentSession.value = null;
}
</script>

<template>
    <NavbarComponent :session="currentSession" @logout="logout" @authenticated="authenticated" />

    <RouterView class="router-view" @authenticated="authenticated" />
</template>

<style scoped>
.router-view {
    max-width: var(--max-width);
    margin: 0 auto;
}
</style>
