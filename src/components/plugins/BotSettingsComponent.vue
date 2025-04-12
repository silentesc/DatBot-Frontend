<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { SESSION_ID_COOKIE } from "@/settings.json";
import { getLogs as http_utils_getLogs } from "@/http_utils/log";
import Cookies from 'js-cookie';
import type { Log } from '@/models';
import LoadingComponent from '../LoadingComponent.vue';
import ErrorComponent from '../ErrorComponent.vue';

const props = defineProps<{
    guildId: string;
}>();

const errorMsg = ref("");
const loading = ref(false);

const logs = ref<Array<Log> | null>(null);
const limit = ref<number>(10);

const getLogs = async () => {
    const sessionId = Cookies.get(SESSION_ID_COOKIE);

    if (!sessionId) {
        return;
    }

    loading.value = true;

    await http_utils_getLogs(props.guildId, limit.value)
        .then((l: Array<Log>) => {
            logs.value = l;
        })
        .catch(error => {
            console.error("Error while getting logs", error);
            errorMsg.value = "Error while getting logs";
        });

    loading.value = false;
}

const getMoreLogs = () => {
    logs.value = null;
    limit.value += 10;
    getLogs();
}

onMounted(() => {
    getLogs();
});
</script>

<template>
    <h1>Bot Settings</h1>
    <h2>Logs</h2>
    <div v-if="logs && logs.length > 0">
        <table>
            <thead>
                <tr>
                    <th>User</th>
                    <th>Action</th>
                    <th>Date / Time</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="log in logs" :key="log.timestamp.toString()">
                    <td>{{ log.user.username }}</td>
                    <td>{{ log.action }}</td>
                    <td>{{ new Date(log.timestamp).toISOString().replace('T', ' ').slice(0, 19) }}</td>
                </tr>
            </tbody>
        </table>
        <button v-if="limit <= logs.length" @click="getMoreLogs" class="button button-primary">Load more</button>
    </div>

    <LoadingComponent v-if="loading" :is-loading="loading" />
    <ErrorComponent v-if="errorMsg.length > 0" :is-visible="errorMsg.length > 0" :error-message="errorMsg"
        @close="errorMsg = ''" />

    <h2 v-if="logs !== null && logs.length === 0">No logs yet...</h2>
</template>

<style scoped>
table {
    width: 100%;
    border-collapse: collapse;
    background-color: var(--background-tertiary);
}

thead {
    background-color: var(--background-secondary);
}

th,
td {
    border: 1px solid #ddd;
    padding: var(--padding-small);
    text-align: left;
}

th {
    font-weight: bold;
}

tr:nth-child(even) {
    background-color: var(--background-secondary);
}
</style>
