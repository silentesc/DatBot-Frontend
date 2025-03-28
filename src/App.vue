<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router'
import axios from 'axios';
import Cookies from 'js-cookie';
import type { Guild, Session } from "@/models";
import settings from "@/settings.json";
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const loading = ref(true);

const session = ref<Session | null>(null);
const botJoinedGuildIds = ref<Array<string>>([]);
const router = useRouter();
const route = useRoute();

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

const loadSessionData = async () => {
  const sessionId: String | undefined = Cookies.get(settings.SESSION_ID_COOKIE)
  if (!sessionId) {
    session.value = null;
    botJoinedGuildIds.value = [];
    loading.value = false;
    return;
  }

  await axios.get(`${settings.BACKEND_URL}/auth/validate_session`, { params: { session_id: sessionId } })
    .then((response) => {
      session.value = response.data;
    }).catch((error) => {
      if (error.status === 404) {
        Cookies.remove(settings.SESSION_ID_COOKIE);
        session.value = null;
      }
    });

  await axios.get(`${settings.BACKEND_URL}/user/user_guilds`, { params: { session_id: sessionId } })
    .then((response) => {
      botJoinedGuildIds.value = [];
      for (const entry of response.data) {
        const guild: Guild = entry["guild"];
        const botJoined = entry["bot_joined"];
        if (botJoined) {
          botJoinedGuildIds.value.push(guild.id);
        }
      }
    }).catch((error) => {
      if (error.status === 404) {
        Cookies.remove(settings.SESSION_ID_COOKIE);
        botJoinedGuildIds.value = [];
      }
    });

  loading.value = false;
};

onMounted(() => {
  loadSessionData();
});
</script>

<template>
  <nav>
    <div class="link-container">
      <RouterLink class="link" :to="{ name: 'HomeView' }">Home</RouterLink>
      <RouterLink class="link" :to="{ name: 'HomeView' }">Placeholder</RouterLink>
      <RouterLink class="link" :to="{ name: 'HomeView' }">Placeholder 2</RouterLink>
      <RouterLink class="link" :to="{ name: 'HomeView' }">Placeholder 3</RouterLink>
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