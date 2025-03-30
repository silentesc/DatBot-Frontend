<script setup lang="ts">
const props = defineProps<{
    guildId: string;
}>();
</script>

<template>
    <h1>Reaction Role</h1>
    {{ props.guildId }}
</template>
