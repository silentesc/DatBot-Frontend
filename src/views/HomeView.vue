<script setup lang="ts">
import axios from 'axios';
import settings from "@/settings.json";

const login_with_discord = async () => {
  await axios.get(`${settings.BACKEND_URL}/auth/login`)
    .then((response) => {
      window.location.href = response.data;
    })
}
</script>

<template>
  <main>
    <h1>Hello World</h1>
    <button @click="login_with_discord">Login with Discord</button>
  </main>
</template>
