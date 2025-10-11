<script setup lang="ts">
import LoadingComponent from "@/components/LoadingComponent.vue";
import { Plugins, type Session } from "@/models";
import { SESSION_ID_COOKIE } from "@/settings.json";
import { getInvite, getValidateSession } from "@/http_utils/auth";
import Cookies from 'js-cookie';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import ErrorComponent from "@/components/ErrorComponent.vue";

const router = useRouter();

const errorMsg = ref("");
const loading = ref(false);

const session = ref<Session | null>(null);

/**
 * API CALLS
 */
const manage = (guildId: string) => {
    router.push({ name: "DashboardView", params: { guildId: guildId, plugin: Plugins.BOT_SETTINGS } })
}

const invite = async (guildId: string) => {
    loading.value = true;

    await getInvite(guildId)
        .then(loginUrl => {
            window.open(loginUrl, '_blank');
        })
        .catch(error => {
            console.error("Error while getting invite url:", error);
            errorMsg.value = error.response.data.detail;
        });

    loading.value = false;
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

    loading.value = true;

    await getValidateSession()
        .then((s: Session) => {
            session.value = s;
        })
        .catch(error => {
            console.error("An error happened while getting user guilds:", error);
            errorMsg.value = error.response.data.detail;
        });

    loading.value = false;
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
                <button v-if="guild.bot_joined" class="button button-primary" @click="manage(guild.id)">Manage</button>
                <button v-else class="button button-secondary" @click="invite(guild.id)">Invite</button>
            </div>
        </div>

        <LoadingComponent v-if="loading" :is-loading="loading" />

        <h1 v-if="session !== null && session.guilds.length === 0">
            No guilds found. You need admin or manage server permissions in at least 1 server
        </h1>

        <ErrorComponent v-if="errorMsg.length > 0" :is-visible="errorMsg.length > 0" :error-message="errorMsg"
            @close="errorMsg = ''" />
    </div>
</template>

<style scoped>
.guild-container {
    margin: var(--margin-large);
    display: flex;
    justify-content: center;
    text-align: center;
    flex-wrap: wrap;
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
