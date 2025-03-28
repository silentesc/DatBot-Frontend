<script setup lang="ts">
import axios from 'axios';
import Cookies from 'js-cookie';
import type { Guild, Session } from "@/models";
import settings from "@/settings.json";
import { onMounted, ref } from 'vue';
import router from '@/router';
import ErrorMessage from '@/components/ErrorMessage.vue';

const errorMessage = ref("");

const loading = ref(true);

const session = ref<Session | null>(null);
const botJoinedGuildIds = ref<Array<string>>([]);

onMounted(async () => {
  const sessionId: String | undefined = Cookies.get(settings.SESSION_ID_COOKIE);
  if (!sessionId) {
    loading.value = false;
    return;
  }

  await axios.get(`${settings.BACKEND_URL}/auth/validate_session`, { params: { session_id: sessionId } })
    .then((response) => {
      session.value = response.data;
    }).catch((error) => {
      if (error.status === 404) {
        Cookies.remove(settings.SESSION_ID_COOKIE);
      }
    });

  await axios.get(`${settings.BACKEND_URL}/user/user_guilds`, { params: { session_id: sessionId } })
    .then((response) => {
      for (const entry of response.data) {
        const guild: Guild = entry["guild"];
        const botJoined = entry["bot_joined"];
        if (botJoined) {
          botJoinedGuildIds.value.push(guild.id);
        }
      }
    }).catch((error) => {
      errorMessage.value = error.response?.data?.message || (error as Error).message || 'An unexpected error occurred.';
      if (error.status === 404) {
        Cookies.remove(settings.SESSION_ID_COOKIE);
      }
      setTimeout(() => {
        errorMessage.value = '';
      }, 3500);
    });

  loading.value = false;
});

const openGuildSettings = async (guildId: string) => {
  if (botJoinedGuildIds.value.includes(guildId)) {
    router.push({ name: 'settings', params: { guildId } });
  } else {
    await axios.get(`${settings.BACKEND_URL}/auth/invite`)
      .then((response) => {
        window.location.href = response.data;
      });
  }
}
</script>

<template>
  <ErrorMessage :message="errorMessage" />
  <div v-if="!loading && session">
    <div class="guilds">
      <div class="guild-card" v-for="guild in session.guilds" :key="guild.id" @click="openGuildSettings(guild.id)">
        <div class="guild-icon-wrapper"
          :class="{ 'bot-joined': botJoinedGuildIds.includes(guild.id), 'bot-not-joined': !botJoinedGuildIds.includes(guild.id) }">
          <img
            :src="guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : 'https://cdn.discordapp.com/embed/avatars/4.png'"
            alt="Guild Icon" class="guild-icon" :class="{ 'grayscale': !botJoinedGuildIds.includes(guild.id) }">
        </div>
        <span class="guild-name">{{ guild.name }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
.guilds {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 20px;
}

.guild-card {
  width: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: var(--background);
  padding: 20px;
  border-radius: 10px;
  border: 1px solid var(--secondary);
  box-shadow: 0 0 10px var(--secondary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.guild-card:hover {
  scale: 1.05;
  box-shadow: 0 0 20px var(--accent);
}

.guild-icon-wrapper {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 2.5px solid transparent;
}

.bot-joined {
  border-color: #37ff7677;
}

.bot-not-joined {
  border-color: #ff000050;
}

.guild-icon {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.grayscale {
  filter: grayscale(100%);
}

.guild-name {
  margin-top: 10px;
  font-size: 16px;
  font-weight: bold;
  color: #fff;
  text-align: center;
}
</style>
