<script setup lang="ts">
import type { Role } from '@/models';
import { ref, computed } from 'vue';

// Define component props. Here we expect an array of roles and a current value.
const props = defineProps<{
    roles: Array<Role>;
    modelValue: string | null;
}>();

// Define the emit for v-model binding (using 'update:modelValue')
const emit = defineEmits<{
    (event: 'update:modelValue', value: number | string): void;
}>();

// Reactive state for toggling the dropdown
const isOpen = ref(false);

// Computed property to determine the selected option's text
const selectedOptionText = computed(() => {
    const option = props.roles.find(role => role.id === props.modelValue);
    return option ? `@${option.name}` : "Select Role";
});

// Toggle dropdown open/close
function toggleDropdown() {
    isOpen.value = !isOpen.value;
}

// Method to select an option and emit the value update
function selectOption(role: Role) {
    emit('update:modelValue', role.id);
    isOpen.value = false;
}

const getColorByRoleId = (roleId: string | null) => {
    if (!roleId) {
        return "#ffffff";
    }
    const role = props.roles.find(role => role.id === roleId);
    if (!role) {
        return decimalToHex(0);
    }
    return decimalToHex(role.color);
}

const decimalToHex = (decimal: number): string => {
    if (decimal === 0) return "#99aab5";
    return '#' + decimal.toString(16).padStart(6, '0');
};
</script>

<template>
    <div class="custom-select" @click="toggleDropdown">
        <!-- Selected Value -->
        <div class="select-trigger">
            <span :style="{color: getColorByRoleId(props.modelValue)}">{{ selectedOptionText }}</span>
            <span class="arrow" :class="{ open: isOpen }"></span>
        </div>
        <!-- Options List -->
        <div v-if="isOpen" class="options">
            <div v-for="role in roles" :key="role.id" class="option" @click.stop="selectOption(role)">
                <span class="span-text" :style="{color: getColorByRoleId(role.id)}">@{{ role.name }}</span>
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

.option:hover {
    background: var(--color-primary);
}
</style>
