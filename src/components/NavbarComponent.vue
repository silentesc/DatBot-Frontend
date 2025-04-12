<script setup lang="ts">
import type { Session } from '@/models';
import { SESSION_ID_COOKIE } from '@/settings.json';
import { getLogin, postLogout, getValidateSession } from "@/http_utils/auth";

import Cookies from 'js-cookie';
import { ref, onMounted } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import ErrorComponent from './ErrorComponent.vue';

const props = defineProps<{
    session: Session | null;
}>();

const errorMsg = ref("");

const router = useRouter();

const emit = defineEmits(["authenticated", "logout"]);

/**
 * LOGIC
 */

const dropdownOpen = ref(false);
const toggleDropdown = () => {
    dropdownOpen.value = !dropdownOpen.value;
}

/**
 * API CALLS
 */

const login = async () => {
    await getLogin()
        .then(loginUrl => {
            window.location.href = loginUrl;
        })
        .catch(error => {
            console.error("Error while getting login url:", error);
            errorMsg.value = "Error while getting login url";
        });
}

const logout = async () => {
    await postLogout()
        .catch(error => {
            console.error("Error during logout:", error);
            errorMsg.value = "Error during logout";
        });

    Cookies.remove(SESSION_ID_COOKIE);

    emit("logout");
    await router.push({ name: "HomeView" });
}

/**
 * LIFECYCLE
 */

onMounted(async () => {
    if (props.session) {
        return;
    }

    const sessionId = Cookies.get(SESSION_ID_COOKIE);
    if (!sessionId) {
        return;
    }

    await getValidateSession()
        .then((session: Session) => {
            emit("authenticated", session);
        })
        .catch(error => {
            console.error("Error while validating session:", error);
            console.log("Logging out because of failed validation...");
            errorMsg.value = "Error while validating session";
            logout();
        });
});
</script>

<template>
    <nav>
        <div class="nav-content">
            <div>
                <RouterLink class="router-link" :to="{ name: 'HomeView' }">Home</RouterLink>
                <RouterLink class="router-link" :to="{ name: 'GuildsView' }">Dashboard</RouterLink>
            </div>
            <div>
                <div v-if="session">
                    <div class="user-container" @click="toggleDropdown">
                        <img class="user-avatar"
                            :src="`https://cdn.discordapp.com/avatars/${session.user.id}/${session.user.avatar}.png`"
                            alt="User Avatar">
                        <span class="user-username">{{ session.user.username }}</span>

                        <!-- Dropdown menu -->
                        <div v-if="dropdownOpen" class="dropdown-menu">
                            <p class="dropdown-item" @click.stop="logout">Logout</p>
                        </div>
                    </div>
                </div>
                <button v-else class="button button-primary" @click="login">Login with Discord</button>
            </div>
        </div>
    </nav>
    <ErrorComponent v-if="errorMsg.length > 0" :is-visible="errorMsg.length > 0" :error-message="errorMsg" @close="errorMsg = ''" />
</template>

<style scoped>
nav {
    height: 40px;

    margin: var(--margin-large);
    padding: var(--padding-large);
    background-color: var(--background-secondary);
    border-radius: 15px;

    display: flex;
    justify-content: center;
    align-items: center;
}

.nav-content {
    width: 100%;
    max-width: var(--max-width);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.router-link {
    color: #fff;
    font-size: 1.4rem;
    margin: var(--margin-normal);
    text-decoration: none;
}

.router-link.router-link-active {
    text-decoration: underline;
}

.user-container {
    display: flex;
    align-items: center;
    width: fit-content;
    position: relative;
    cursor: pointer;
}

.user-avatar {
    margin-right: var(--margin-small);
    width: 40px;
    border-radius: 50%;
}

.user-username {
    font-size: 1.2rem;
}

.dropdown-menu {
    width: auto;
    min-width: 100%;
    position: absolute;
    top: 100%;
    right: 0;
    background-color: var(--background-secondary);
    border-radius: 5px;
    padding: var(--padding-small);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    z-index: 1000;
}

.dropdown-item {
    margin: 0;
    padding: var(--padding-small);
    border-radius: 7px;
}

.dropdown-item:hover {
    background-color: rgba(0, 0, 0, 0.1);
}
</style>
