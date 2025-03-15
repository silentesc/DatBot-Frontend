<script setup lang="ts">
import Cookies from "js-cookie";
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import settings from "@/settings.json";
import type { Session } from "@/models";

const loading = ref(true);

const route = useRoute();
const router = useRouter();

const code: String = String(route.query.code);

onMounted(() => {
    axios.get(`${settings.BACKEND_URL}/auth/discord/callback`, { params: { code: code } })
        .then((response) => {
            const session: Session = response.data;
            Cookies.set(settings.SESSION_ID_COOKIE, session.session_id, { expires: 7, secure: true });
            router.push({ name: 'HomeView' });
        });

    loading.value = false;
});
</script>

<template>
    <h1>Callback</h1>
    <h2 v-if="loading">Loading...</h2>
</template>
