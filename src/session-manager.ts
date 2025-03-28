// session-manager.ts
import axios from "axios";
import Cookies from "js-cookie";
import type { Guild, Session } from "@/models";
import settings from "@/settings.json";
import { ref } from "vue";

const session = ref<Session | null>(null);
const botJoinedGuildIds = ref<Array<string>>([]);
const isLoading = ref(false);
const errorMessage = ref("");

async function loadSessionData() {
  isLoading.value = true;
  errorMessage.value = "";
  const sessionId: String | undefined = Cookies.get(settings.SESSION_ID_COOKIE);
  if (!sessionId) {
    session.value = null;
    botJoinedGuildIds.value = [];
    isLoading.value = false;
    return;
  }

  try {
    const sessionResponse = await axios.get(
      `${settings.BACKEND_URL}/auth/validate_session`,
      { params: { session_id: sessionId } }
    );
    session.value = sessionResponse.data;

    const guildsResponse = await axios.get(
      `${settings.BACKEND_URL}/user/user_guilds`,
      { params: { session_id: sessionId } }
    );
    botJoinedGuildIds.value = [];
    for (const entry of guildsResponse.data) {
      const guild: Guild = entry["guild"];
      const botJoined = entry["bot_joined"];
      if (botJoined) {
        botJoinedGuildIds.value.push(guild.id);
      }
    }
  } catch (error: any) {
    if (error.response?.status === 404) {
      Cookies.remove(settings.SESSION_ID_COOKIE);
      session.value = null;
      botJoinedGuildIds.value = [];
    } else {
      errorMessage.value =
        error.response?.data?.message ||
        error.message ||
        "An unknown error occurred";
      setTimeout(() => {
        errorMessage.value = "";
      }, 3500);
    }
  } finally {
    isLoading.value = false;
  }
}

function logout() {
  Cookies.remove(settings.SESSION_ID_COOKIE);
  session.value = null;
  botJoinedGuildIds.value = [];
  window.location.reload();
}

export {
  session,
  botJoinedGuildIds,
  isLoading,
  errorMessage,
  loadSessionData,
  logout,
};
