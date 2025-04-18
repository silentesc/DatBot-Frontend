<script setup lang="ts">
import type { Channel } from '@/models';
import { ref, computed } from 'vue';

// Define component props. Here we expect an array of channels and a current value.
const props = defineProps<{
    channels: Array<Channel>;
    modelValue?: number | string | null;
}>();

// Define the emit for v-model binding (using 'update:modelValue')
const emit = defineEmits<{
    (event: 'update:modelValue', value: number | string): void;
}>();

// Reactive state for toggling the dropdown
const isOpen = ref(false);

// Computed property to determine the selected option's text
const selectedOptionText = computed(() => {
    const option = props.channels.find(ch => ch.id === props.modelValue && ch.type !== 4);
    return option ? `#${option.name}` : "Select Channel";
});

// Toggle dropdown open/close
function toggleDropdown() {
    isOpen.value = !isOpen.value;
}

// Method to select an option and emit the value update
function selectOption(channel: Channel) {
    if (channel.type === 4) {
        return;
    }
    emit('update:modelValue', channel.id);
    isOpen.value = false;
}
</script>

<template>
    <div class="custom-select" @click="toggleDropdown">
        <!-- Selected Value -->
        <div class="select-trigger">
            {{ selectedOptionText }}
            <span class="arrow" :class="{ open: isOpen }"></span>
        </div>
        <!-- Options List -->
        <div v-if="isOpen" class="options">
            <div v-for="channel in channels" :key="channel.id" class="option" :class="{categoryOption: channel.type === 4, textOption: channel.type === 0}" @click.stop="selectOption(channel)">
                <span class="span-category" v-if="channel.type === 4">
                    <span class="arrow"></span> &nbsp;
                    {{ channel.name }}
                </span>
                <span class="span-text" v-if="channel.type === 0">#{{ channel.name }}</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.custom-select {
    position: relative;
    width: 100%;
    user-select: none;
}

.select-trigger {
    border: 2px solid var(--background-primary);
    padding: 10px;
    background: var(--background-secondary);
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 1.1rem;
}

.arrow {
    border: solid #999;
    border-width: 0 2px 2px 0;
    display: inline-block;
    padding: 4px;
    transform: rotate(45deg);
    transition: transform 0.2s ease;
}

.arrow.open {
    transform: rotate(-135deg);
}

.options {
    position: absolute;
    top: calc(100% + 2px);
    left: 0;
    right: 0;
    border: 2px solid var(--background-primary);
    background: var(--background-secondary);
    z-index: 1000;
    max-height: 400px;
    overflow-y: auto;
}

.option {
    padding: 10px;
    cursor: pointer;
    font-size: 1.1rem;
}

.textOption:hover {
    background: var(--color-primary);
}

.categoryOption {
    background-color: var(--background-tertiary);
}
</style>
