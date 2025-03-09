<script setup lang="ts">
import axios from 'axios';
import Cookies from 'js-cookie';
import type { Session } from "@/models";
import settings from "@/settings.json";
import { onMounted, ref } from 'vue';

const session = ref<Session | null>(null);

const login_with_discord = async () => {
  await axios.get(`${settings.BACKEND_URL}/auth/login`)
    .then((response) => {
      window.location.href = response.data;
    })
}

onMounted(async () => {
  const sessionId: String | undefined = Cookies.get("session_id")
  if (!sessionId) {
    return;
  }

  await axios.get(`${settings.BACKEND_URL}/auth/validate`, { params: { session_id: sessionId } })
    .then((response) => {
      session.value = response.data;
    })
});
</script>

<template>
  <main>
    <h1>DatBot</h1>
    <button v-if="!session" @click="login_with_discord">Login with Discord</button>
    <div v-else>
      Logged in as {{ session.user.username }}
    </div>
  </main>
</template>
