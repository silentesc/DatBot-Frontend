<script setup lang="ts">
import { Plugins } from '@/models';
import { computed, ref } from 'vue';

const navElement = ref<HTMLElement | null>(null);

const props = defineProps<{
    plugin: string;
}>();

const emit = defineEmits(["plugin-selected"]);

const selectPlugin = (plugin: string) => {
    emit("plugin-selected", plugin);
}

/**
 * LOGIC
 */
const computedHeight = computed(() => {
    let distanceFromTop = 0;
    if (navElement.value) {
        distanceFromTop = navElement.value.getBoundingClientRect().top;
    }
    return `calc(100vh - var(--margin-large) * 2 - var(--padding-large) * 2 - ${distanceFromTop}px)`;
});
</script>

<template>
    <nav ref="navElement" :style="{ height: computedHeight }">
        <a :class="{ underline: props.plugin === Plugins.OVERVIEW }" @click="selectPlugin(Plugins.OVERVIEW)">Overview</a>
        <a :class="{ underline: props.plugin === Plugins.WELCOME_MESSAGE }"
            @click="selectPlugin(Plugins.WELCOME_MESSAGE)">Welcome Message</a>
        <a :class="{ underline: props.plugin === Plugins.REACTION_ROLES }"
            @click="selectPlugin(Plugins.REACTION_ROLES)">Reaction Roles</a>
    </nav>
</template>

<style scoped>
nav {
    width: 200px;
    /* Height is computed above */

    margin: var(--margin-large);
    margin-left: 0;
    padding: var(--padding-large);
    background-color: var(--background-secondary);
    border-radius: 15px;
}

a {
    display: block;
    margin: var(--margin-small);
    color: #fff;
    font-size: 1.2rem;
    text-decoration: none;
    margin-bottom: 10px;
}

.underline {
    text-decoration: underline;
}

a:hover {
    cursor: pointer;
}
</style>
