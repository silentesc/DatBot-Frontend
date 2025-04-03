<script setup lang="ts">
import { Plugins, type UserGuild } from "@/models";
import { BACKEND_URL, SESSION_ID_COOKIE } from "@/settings.json";
import axios from 'axios';
import Cookies from 'js-cookie';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const userGuilds = ref<Array<UserGuild> | null>(null);

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
        router.push({ name: "HomeView" });
        return;
    }

    await axios.get(`${BACKEND_URL}/user/user_guilds`, { params: { session_id: sessionId } })
        .then((response) => {
            userGuilds.value = response.data;
        })
        .catch((error) => {
            console.error("An error happened while getting user guilds:", error);
        });
});
</script>

<template>
    <div>
        <div v-if="userGuilds" class="user-guild-container">
            <div v-for="userGuild in userGuilds" :key="userGuild.guild.id" class="user-guild-card">
                <img :class="{ 'guild-icon': true, 'grayscale': !userGuild.bot_joined }"
                    :src="userGuild.guild.icon ? `https://cdn.discordapp.com/icons/${userGuild.guild.id}/${userGuild.guild.icon}.png` : 'https://cdn.discordapp.com/embed/avatars/4.png'"
                    alt="Guild Icon">
                <p class="guild-name">{{ userGuild.guild.name }}</p>
                <button v-if="userGuild.bot_joined" class="button button-primary"
                    @click="manage(userGuild.guild.id)">Manage</button>
                <button v-else class="button button-secondary" @click="invite()">Invite</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.user-guild-container {
    margin: var(--margin-large);
    display: flex;
    justify-content: center;
    text-align: center;
}

.user-guild-card {
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
