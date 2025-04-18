<script setup lang="ts">
import { deleteAutoRole, getAutoRoles, postAutoRole } from '@/http_utils/auto_role';
import type { Role } from '@/models';
import { onMounted, ref, watch } from 'vue';
import LoadingComponent from '@/components/LoadingComponent.vue';
import ErrorComponent from '@/components/ErrorComponent.vue';
import { decimalToHex } from '@/utils/color_utils';
import RoleSelectComponent from '@/components/RoleSelectComponent.vue';
import { getRoles } from '@/http_utils/guild';

const props = defineProps<{
    guildId: string;
}>();

const loading = ref<boolean>(false);
const errorMsg = ref<string>("");

const newRoleId = ref<string | null>(null);

const roles = ref<Array<Role>>([]);
const autoRoles = ref<Array<Role>>([]);

/**
 * EVENTS
 */

watch(newRoleId, async () => {
    if (!newRoleId.value) {
        return;
    }
    loading.value = true;
    await postAutoRole(props.guildId, newRoleId.value)
        .then((role: Role | null) => {
            if (role) {
                autoRoles.value.push(role);
            }
            newRoleId.value = null;
        })
        .catch(error => {
            console.error("Error while adding auto role", error);
            errorMsg.value = "Error while adding auto role";
        });
    loading.value = false;
});

const removeAutoRole = async (roleId: string) => {
    loading.value = true;
    await deleteAutoRole(props.guildId, roleId)
        .then(_ => {
            autoRoles.value = autoRoles.value.filter(autoRole => autoRole.id !== roleId);
        })
        .catch(error => {
            console.error("Error while deleting auto role", error);
            errorMsg.value = "Error while deleting auto role";
        });
    loading.value = false;
}

/**
 * LIFECYCLE
 */

onMounted(async () => {
    if (!props.guildId) {
        return;
    }

    loading.value = true;

    try {
        const [rolesResult, autoRolesResult] = await Promise.all([
            getRoles(props.guildId),
            getAutoRoles(props.guildId)
        ]);
        roles.value = rolesResult;
        autoRoles.value = autoRolesResult;
    } catch (error) {
        console.error("Error while fetching roles or auto roles", error);
        errorMsg.value = "Error while fetching roles or auto roles";
    }

    loading.value = false;
})
</script>

<template>
    <div class="roles-container" v-if="!loading">
        <div class="role" v-for="autoRole in autoRoles" :key="autoRole.id">
            <span :style="{ color: decimalToHex(autoRole.color) }">@{{ autoRole.name }}</span>
            <span class="remove" @click="removeAutoRole(autoRole.id)">✕</span>
        </div>
        <RoleSelectComponent :roles="roles.filter(role => !autoRoles.map(autoRole => autoRole.id).includes(role.id))" v-model="newRoleId" />
    </div>

    <LoadingComponent v-if="loading" :is-loading="loading" />
    <ErrorComponent v-if="errorMsg.length > 0" :is-visible="errorMsg.length > 0" :error-message="errorMsg"
        @close="errorMsg = ''" />
</template>

<style scoped>
.roles-container {
    width: 100%;
    background-color: var(--background-tertiary);
    padding: 10px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.role {
    width: fit-content;
    background-color: var(--background-secondary);
    padding: 5px 10px;
    border-radius: 4px;
    display: inline-flex;
    align-items: center;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.role .remove {
    margin-left: 8px;
    cursor: pointer;
    font-weight: bold;
    color: #ff0000;
}
</style>
