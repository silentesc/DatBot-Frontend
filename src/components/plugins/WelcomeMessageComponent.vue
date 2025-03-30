<script setup lang="ts">
const props = defineProps<{
    guildId: string;
}>();
</script>

<template>
    <h1>Welcome Message</h1>
    {{ props.guildId }}
</template>
