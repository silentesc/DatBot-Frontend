<script setup lang="ts">
import LoadingComponent from "@/components/LoadingComponent.vue";
import { Plugins, type Session } from "@/models";
import { BACKEND_URL, SESSION_ID_COOKIE } from "@/settings.json";
import axios from 'axios';
import Cookies from 'js-cookie';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const session = ref<Session | null>(null);

/**
 * API CALLS
 */
const manage = (guildId: string) => {
    router.push({ name: "DashboardView", params: { guildId: guildId, plugin: Plugins.BOT_SETTINGS } })
}

const invite = async () => {
    await axios.get(`${BACKEND_URL}/auth/invite`)
        .then((response) => {
            window.open(response.data, '_blank');
        })
        .catch((error) => {
            console.error("Error while getting invite url:", error);
        });
}

/**
 * LIFECYCLE
 */
onMounted(async () => {
    const sessionId = Cookies.get(SESSION_ID_COOKIE);

    if (!sessionId) {
        await router.push({ name: "HomeView" });
        return;
    }

    await axios.get(`${BACKEND_URL}/auth/validate_session`, { params: { session_id: sessionId } })
        .then((response) => {
            session.value = response.data;
        })
        .catch((error) => {
            console.error("An error happened while getting user guilds:", error);
        });
});
</script>

<template>
    <div>
        <div v-if="session" class="guild-container">
            <div v-for="guild in session.guilds" :key="guild.id" class="guild-card">
                <img :class="{ 'guild-icon': true, 'grayscale': !guild.bot_joined }"
                    :src="guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : 'https://cdn.discordapp.com/embed/avatars/4.png'"
                    alt="Guild Icon">
                <p class="guild-name">{{ guild.name }}</p>
                <button v-if="guild.bot_joined" class="button button-primary"
                    @click="manage(guild.id)">Manage</button>
                <button v-else class="button button-secondary" @click="invite()">Invite</button>
            </div>
        </div>

        <LoadingComponent v-if="session?.guilds === null" :is-loading="session.guilds === null" />

        <h1 v-if="session !== null && session.guilds.length === 0">
            No guilds found. You need admin or manage server permissions in at least 1 server
        </h1>
    </div>
</template>

<style scoped>
.guild-container {
    margin: var(--margin-large);
    display: flex;
    justify-content: center;
    text-align: center;
}

.guild-card {
    margin: var(--margin-normal);
    padding: var(--padding-normal);
    width: fit-content;
    min-width: 200px;
    background-color: var(--background-secondary);
    border-radius: 12px;
}

.guild-icon {
    width: 7rem;
    border: 2px solid #37ff76;
    border-radius: 50%;
}

.guild-name {
    margin: var(--margin-small);
    font-size: 1.3rem;
}

.grayscale {
    filter: grayscale(100%);
}
</style>
