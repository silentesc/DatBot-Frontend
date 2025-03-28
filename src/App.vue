<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router';
import { session, logout, loadSessionData } from '@/session-manager.ts';
import { onMounted } from 'vue';
import settings from "@/settings.json";
import axios from 'axios';

onMounted(() => {
  loadSessionData();
});

const login_with_discord = async () => {
  await axios.get(`${settings.BACKEND_URL}/auth/login`)
    .then((response) => {
      window.location.href = response.data;
    });
}
</script>

<template>
  <nav>
    <div class="link-container">
      <RouterLink class="link" :to="{ name: 'LandingPage' }">Home</RouterLink>
      <RouterLink class="link" :to="{ name: 'HomeView' }">Dashboard</RouterLink>
    </div>

    <div class="auth-container">
      <button v-if="!session" @click="login_with_discord" class="login-button">Login with Discord</button>
      <div v-else class="user-login">
        <img :src="`https://cdn.discordapp.com/avatars/${session.user.id}/${session.user.avatar}.png`" alt="User Avatar"
          width="40px">
        <span class="username">{{ session.user.username }}</span>
        <button @click="logout" class="danger-button">Logout</button>
      </div>
    </div>
  </nav>

  <RouterView @auth-changed="loadSessionData" />
</template>

<style lang="css" scoped>
nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1.5rem;
  background-color: var(--background);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  border-radius: 5px;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--secondary);
  border-right: 0.25px solid var(--secondary);
  border-left: 0.25px solid var(--secondary);
}

.link-container {
  display: flex;
  gap: 10px;
}

.auth-container {
  display: flex;
  align-items: center;
}

.link {
  font-size: 1.2em;
  color: #fff;
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 5px;
  background-color: var(--secondary);
  transition: all 0.3s ease;
}

.link:hover {
  background-color: var(--accent);
  scale: 1.05;
}

.user-login {
  display: flex;
  align-items: center;
  gap: 10px;
}

.username {
  font-size: 1.2em;
  font-weight: bold;
  color: #fff;
}

.login-button {
  padding: 12px 12px;
  font-size: 1.2em;
  color: #fff;
  background-color: #7289da;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.login-button:hover {
  background-color: #5b6eae;
}

.danger-button {
  padding: 12px 12px;
  font-size: 1.2em;
  color: #fff;
  background-color: #994141;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.danger-button:hover {
  scale: 1.05;
  background-color: #753232;
}
</style>