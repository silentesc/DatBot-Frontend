<script setup lang="ts">
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { BACKEND_URL, SESSION_ID_COOKIE } from "@/settings.json";
import Cookies from 'js-cookie';
import type { Log } from '@/models';
import LoadingComponent from '../LoadingComponent.vue';

const props = defineProps<{
    guildId: string;
}>();

const logs = ref<Array<Log> | null>(null);
const limit = ref<number>(10);

const getLogs = () => {
    const sessionId = Cookies.get(SESSION_ID_COOKIE);

    if (!sessionId) {
        return;
    }

    axios.get(`${BACKEND_URL}/log/logs/${props.guildId}`, {
        params: { session_id: sessionId, limit: limit.value },
    })
        .then((response) => {
            logs.value = response.data;
        })
        .catch((error) => {
            console.error("Error while getting logs", error);
        });
}

const getMoreLogs = () => {
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
    <div v-if="logs">
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

    <LoadingComponent v-if="logs === null" :is-loading="logs === null" />

    <h2 v-if="logs !== null && logs.length === 0">No logs yet...</h2>
</template>

<style scoped>
table {
    width: 100%;
    border-collapse: collapse;
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
