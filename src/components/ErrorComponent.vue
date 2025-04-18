<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';


const props = defineProps({
    isVisible: {
        type: Boolean,
        required: true,
    },
    errorMessage: {
        type: String,
        required: true,
    },
});

const currentIntervalId = ref<number | undefined>(undefined);
const timerKey = ref(0);

const emit = defineEmits(["close"]);

/**
 * EMITS
 */

const closeModal = () => {
    emit('close');
};

const startCloseTimer = () => {
    if (props.errorMessage.length < 1) {
        return;
    }
    timerKey.value++;
    clearInterval(currentIntervalId.value);
    
    currentIntervalId.value = setTimeout(() => {
        closeModal();
    }, 5000);
}

watch(() => props.errorMessage, () => {
    startCloseTimer();
});

onMounted(() => {
    startCloseTimer();
});
</script>

<template>
    <div v-if="isVisible" class="div-error" @click.stop>
        <h2>Error</h2>
        <p>{{ props.errorMessage }}</p>
        <div class="timer-bar" :key="timerKey"></div>
    </div>
</template>

<style scoped>
.div-error {
    bottom: 2rem;
    right: 2rem;
    background: var(--color-danger);
    border-radius: 8px;
    padding: var(--padding-large);
    position: fixed;
    overflow: auto;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

h2,
p {
    margin: 0;
}

p {
    font-size: 1.2rem;
}

.timer-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 4px;
    background-color: rgba(255, 255, 255, 0.7);
    width: 100%;
    animation: countdown 5s linear forwards;
}

@keyframes countdown {
    from {
        width: 100%;
    }

    to {
        width: 0%;
    }
}
</style>
