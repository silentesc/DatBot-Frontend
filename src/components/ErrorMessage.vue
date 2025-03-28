<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps({
    message: {
        type: String,
        required: true,
    },
});

const isVisible = ref(false);

watch(
    () => props.message,
    (newVal) => {
        if (newVal) {
            isVisible.value = true;
            setTimeout(() => {
                isVisible.value = false;
            }, 3000);
        }
    }
);
</script>

<template>
    <div v-if="isVisible" class="error-message">
        <p>{{ message }}</p>
    </div>
</template>

<style scoped>
.error-message {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #f8d7da;
    color: #721c24;
    padding: 15px;
    border: 1px solid #ad6a70;
    border-radius: 5px;
    z-index: 1000;
    opacity: 0;
    animation: fadeInOut 3s ease-in-out forwards;
}

@keyframes fadeInOut {

    0%,
    100% {
        opacity: 0;
    }

    10%,
    90% {
        opacity: 1;
    }
}
</style>