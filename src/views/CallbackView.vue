<script setup lang="ts">
import Cookies from "js-cookie";
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { BACKEND_URL, SESSION_ID_COOKIE, USER_ID_COOKIE, USER_USERNAME_COOKIE, USER_AVATAR_COOKIE } from "@/settings.json";
import type { Session } from "@/models";
import LoadingComponent from "@/components/LoadingComponent.vue";

const loading = ref(true);
const router = useRouter();

const emit = defineEmits(["authenticated"]);

onMounted(async () => {
    await axios.get(`${BACKEND_URL}/auth/discord/callback`, { params: { code: String(router.currentRoute.value.query.code) } })
        .then((response) => {
            const session: Session = response.data;
            Cookies.set(SESSION_ID_COOKIE, session.session_id, { expires: 7, secure: true, sameSite: 'none' });
            Cookies.set(USER_ID_COOKIE, session.user.id, { expires: 7 });
            Cookies.set(USER_USERNAME_COOKIE, session.user.username, { expires: 7 });
            Cookies.set(USER_AVATAR_COOKIE, session.user.avatar, { expires: 7 });
            emit("authenticated", session);
            router.push({ name: "GuildsView" });
        });

    loading.value = false;
});
</script>

<template>
    <div>
        <LoadingComponent v-if="loading" :is-loading="loading" />
    </div>
</template>
