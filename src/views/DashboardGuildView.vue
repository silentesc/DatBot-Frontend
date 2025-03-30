<script setup lang="ts">
import DashboardNavbarComponent from '@/components/DashboardNavbarComponent.vue';
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const guildId = ref<string>(route.params.guildId as string);
</script>

<template>
    <div>
        <DashboardNavbarComponent />
        <h1>DashboardGuildView</h1>
        {{ guildId }}
    </div>
</template>
