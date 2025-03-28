<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { session, botJoinedGuildIds, isLoading, errorMessage, loadSessionData } from '@/session-manager.ts';
import router from '@/router';
import ErrorMessage from '@/components/ErrorMessage.vue';
import axios from 'axios';
import settings from "@/settings.json";
import LandingPage from './LandingPage.vue';

onMounted(() => {
  if (!session.value) {
    loadSessionData();
  }
});

const guildsJoinedByBot = computed(() => {
  return session.value?.guilds.filter(guild => botJoinedGuildIds.value.includes(guild.id)) || [];
});

const guildsNotJoinedByBot = computed(() => {
  return session.value?.guilds.filter(guild => !botJoinedGuildIds.value.includes(guild.id)) || [];
});

const openGuildSettings = async (guildId: string) => {
  if (botJoinedGuildIds.value.includes(guildId)) {
    router.push({ name: 'settings', params: { guildId } });
  } else {
    try {
      const response = await axios.get(`${settings.BACKEND_URL}/auth/invite`);
      window.location.href = response.data;
    } catch (error: any) {
      errorMessage.value = error.response?.data?.message || error.message || 'An unknown error occurred.';
      setTimeout(() => {
        errorMessage.value = '';
      }, 3500);
    }
  }
}
</script>

<template>
  <ErrorMessage :message="errorMessage" />
  <LandingPage v-if="!session" />
  <div v-else-if="!isLoading && session">
    <div class="guilds">
      <div class="guild-card" v-for="guild in guildsJoinedByBot" :key="guild.id" @click="openGuildSettings(guild.id)">
        <div class="guild-icon-wrapper bot-joined">
          <img
            :src="guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : 'https://cdn.discordapp.com/embed/avatars/4.png'"
            alt="Guild Icon" class="guild-icon">
        </div>
        <span class="guild-name">{{ guild.name }}</span>
      </div>

      <div class="guild-card" v-for="guild in guildsNotJoinedByBot" :key="guild.id"
        @click="openGuildSettings(guild.id)">
        <div class="guild-icon-wrapper bot-not-joined">
          <img
            :src="guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : 'https://cdn.discordapp.com/embed/avatars/4.png'"
            alt="Guild Icon" class="guild-icon grayscale">
        </div>
        <span class="guild-name">{{ guild.name }}</span>
      </div>
    </div>
  </div>
  <div v-else-if="isLoading">
    <p>Loading Data</p>
  </div>
  <div v-else>
    <p></p>
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
