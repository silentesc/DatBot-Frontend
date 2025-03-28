<script setup lang="ts">
import Cookies from "js-cookie";
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import settings from "@/settings.json";
import type { Session } from "@/models";
import { getCurrentInstance } from 'vue';

const loading = ref(true);
const router = useRouter();
const { emit } = getCurrentInstance()!;

onMounted(() => {
    axios.get(`${settings.BACKEND_URL}/auth/discord/callback`, { params: { code: String(router.currentRoute.value.query.code) } })
        .then((response) => {
            const session: Session = response.data;
            Cookies.set(settings.SESSION_ID_COOKIE, session.session_id, { expires: 7, secure: true, sameSite: 'none' });
            emit('auth-changed');
            router.push({ name: 'HomeView' });
        });

    loading.value = false;
});
</script>

<template>
    <h1>Callback</h1>
    <h2 v-if="loading">Loading...</h2>
</template>
