<script setup lang="ts">
const props = defineProps({
    isLoading: {
        type: Boolean,
        required: true,
    },
    message: {
        type: String,
        default: "Loading...",
    },
});
</script>

<template>
    <div class="loading-component" v-if="isLoading">
        <div class="spinner"></div>
        <p class="loading-text">{{ message }}</p>
    </div>
</template>

<style scoped>
.loading-component {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--padding-large);
    background-color: var(--background-tertiary);
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    text-align: center;
}

.spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #ccc;
    border-top: 4px solid var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.loading-text {
    margin-top: var(--margin-normal);
    margin-bottom: 0;
    font-size: 1.3rem;
    color: #fff;
}
</style>
