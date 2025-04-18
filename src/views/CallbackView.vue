<script setup lang="ts">
import Cookies from "js-cookie";
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { SESSION_ID_COOKIE } from "@/settings.json";
import { getDiscordCallback } from "@/http_utils/auth";
import type { Session } from "@/models";
import LoadingComponent from "@/components/LoadingComponent.vue";
import ErrorComponent from "@/components/ErrorComponent.vue";

const errorMsg = ref("");

const loading = ref(true);
const router = useRouter();

const emit = defineEmits(["authenticated"]);

onMounted(async () => {
    const code: string = String(router.currentRoute.value.query.code);
    await getDiscordCallback(code)
        .then((session: Session) => {
            Cookies.set(SESSION_ID_COOKIE, session.session_id, { expires: 7, secure: true, sameSite: 'none' });
            emit("authenticated", session);
            router.push({ name: "GuildsView" });
        })
        .catch(error => {
            console.error("Error while discord callback:", error);
            errorMsg.value = "Error while discord callback";
        })

    loading.value = false;
});
</script>

<template>
    <div>
        <LoadingComponent v-if="loading" :is-loading="loading" />
        <ErrorComponent v-if="errorMsg.length > 0" :is-visible="errorMsg.length > 0" :error-message="errorMsg" @close="errorMsg = ''" />
    </div>
</template>
