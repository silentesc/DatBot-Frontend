<script setup lang="ts">
import axios from 'axios';
import Cookies from 'js-cookie';
import type { Session } from "@/models";
import settings from "@/settings.json";
import { onMounted, ref } from 'vue';

const loading = ref(true);

const session = ref<Session | null>(null);

const login_with_discord = async () => {
  await axios.get(`${settings.BACKEND_URL}/auth/login`)
    .then((response) => {
      window.location.href = response.data;
    });
}

const logout = () => {
  Cookies.remove(settings.SESSION_ID_COOKIE);
  window.location.reload();
}

onMounted(async () => {
  const sessionId: String | undefined = Cookies.get(settings.SESSION_ID_COOKIE)
  if (!sessionId) {
    loading.value = false;
    return;
  }

  await axios.get(`${settings.BACKEND_URL}/auth/validate`, { params: { session_id: sessionId } })
    .then((response) => {
      session.value = response.data;
    }).catch((error) => {
      if (error.status === 404) {
        Cookies.remove(settings.SESSION_ID_COOKIE);
      }
    });

  loading.value = false;
});
</script>

<template>
  <div v-if="!loading">
    <!-- Login button -->
    <button v-if="!session" @click="login_with_discord" class="login-button">Login with Discord</button>
    <div v-else>
      <!-- User Login -->
      <div class="user-login">
        <img :src="`https://cdn.discordapp.com/avatars/${session.user.id}/${session.user.avatar}.png`"
          alt="User Avatar" width="50px">
        <span class="username">{{ session.user.username }}</span>
        <button @click="logout" class="logout-button">Logout</button>
      </div>
      <!-- Guilds -->
      <div class="guilds">
        <div class="guild-card" v-for="guild in session.guilds">
          <img v-if="guild.icon" :src="`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`" alt="Guild Icon" width="100px">
          <img v-else src="https://cdn.discordapp.com/embed/avatars/2.png" alt="Guild Icon" width="100px">
          <span class="guild-name">{{ guild.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
.login-button {
  padding: 10px 20px;
  font-size: 16px;
  color: #fff;
  background-color: #7289da;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.login-button:hover {
  background-color: #5b6eae;
}

.user-login {
  width: fit-content;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background-color: #fff;
  padding: 10px 20px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

img {
  border-radius: 50%;
  border: 2px solid #000;
}

.username {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.logout-button {
  padding: 10px 20px;
  font-size: 16px;
  color: #fff;
  background-color: #f04747;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.logout-button:hover {
  background-color: #d03a3a;
}

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
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.guild-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.guild-name {
  margin-top: 10px;
  font-size: 16px;
  font-weight: bold;
  color: #333;
  text-align: center;
}
</style>
