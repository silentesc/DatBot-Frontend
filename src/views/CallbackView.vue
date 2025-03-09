<script setup lang="ts">
import Cookies from "js-cookie";
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import settings from "@/settings.json";
import type { Guild, User } from '@/models';

const route = useRoute();

const code: String = String(route.query.code);
const user = ref<User | null>(null);
const guilds = ref<Array<Guild>>([]);

onMounted(() => {
    axios.get(`${settings.BACKEND_URL}/auth/discord/callback`, { params: { code: code } })
        .then((response) => {
            Cookies.set("session_id", response.data.session_id, { expires: 1, secure: true });
            user.value = response.data.user;
            guilds.value = response.data.guilds;
        });
});
</script>

<template>
    <h1>Callback</h1>

    <div v-if="user">
        <h2>{{ user.username }}</h2>
    </div>

    <div v-for="guild in guilds">
        {{ guild.name }}
    </div>
</template>
