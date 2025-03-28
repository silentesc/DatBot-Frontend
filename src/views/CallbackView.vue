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
            Cookies.set(settings.SESSION_ID_COOKIE, session.session_id, { expires: 7, secure: true });
            emit('auth-changed');
            router.push({ name: 'HomeView' });
        });

    loading.value = false;
});
</script>

<template>
    <h1>Loading...</h1>
</template>

<style scoped>
h1 {
    text-align: center;
    margin-top: 20%;
    color: #fff;
    background-image: linear-gradient(to right, #333 20%, #888 40%, #333 60%);
    background-size: 200% auto;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shimmer 1.5s infinite linear;
}

@keyframes shimmer {
    0% {
        background-position: -200% center;
    }

    100% {
        background-position: 200% center;
    }}
</style>