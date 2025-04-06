<script setup lang="ts">
import type { Session } from '@/models';
import { SESSION_ID_COOKIE, USER_ID_COOKIE, USER_USERNAME_COOKIE, USER_AVATAR_COOKIE, BACKEND_URL } from '@/settings.json';
import axios from 'axios';
import Cookies from 'js-cookie';
import { ref, onMounted, watchEffect } from 'vue';
import { RouterLink } from 'vue-router';

const props = defineProps<{
    session: Session | null;
}>();

const userId = ref<string | undefined>(Cookies.get(USER_ID_COOKIE));
const userUsername = ref<string | undefined>(Cookies.get(USER_USERNAME_COOKIE));
const userAvatar = ref<string | undefined>(Cookies.get(USER_AVATAR_COOKIE));

const emit = defineEmits(["authenticated", "logout"]);

/**
 * LOGIC
 */

const dropdownOpen = ref(false);
const toggleDropdown = () => {
    dropdownOpen.value = !dropdownOpen.value;
}

watchEffect(() => {
    if (props.session) {
        userId.value = props.session.user.id;
        userUsername.value = props.session.user.username;
        userAvatar.value = props.session.user.avatar;
    }
});

/**
 * API CALLS
 */

const login = async () => {
    await axios.get(`${BACKEND_URL}/auth/login`)
        .then((response) => {
            window.location.href = response.data;
        })
        .catch((error) => {
            console.error("Error while getting login url:", error);
        });
}

const logout = async () => {
    const sessionId = Cookies.get(SESSION_ID_COOKIE);
    if (!sessionId) {
        console.warn("No session ID found. Cannot log out.");
        return;
    }

    await axios.post(`${BACKEND_URL}/auth/logout`, null, { params: { session_id: sessionId } })
        .catch((error) => {
            console.error("Error during logout:", error);
        });

    Cookies.remove(SESSION_ID_COOKIE);
    Cookies.remove(USER_ID_COOKIE);
    Cookies.remove(USER_USERNAME_COOKIE);
    Cookies.remove(USER_AVATAR_COOKIE);

    emit("logout");
}

/**
 * LIFECYCLE
 */

onMounted(async () => {
    const sessionId = Cookies.get(SESSION_ID_COOKIE);

    if (!sessionId) {
        return;
    }

    if (props.session) {
        return;
    }

    if (userId.value && userUsername.value && userAvatar.value) {
        return;
    }

    await axios.get(`${BACKEND_URL}/auth/validate_session`, { params: { session_id: sessionId } })
        .then((response) => {
            emit("authenticated", response.data);
        })
        .catch((error) => {
            console.error("Error while validating session:", error);
            console.log("Logging out because of failed validation...");
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
                <div v-if="userId && userUsername && userAvatar">
                    <div class="user-container" @click="toggleDropdown">
                        <img class="user-avatar" :src="`https://cdn.discordapp.com/avatars/${userId}/${userAvatar}.png`"
                            alt="User Avatar">
                        <span class="user-username">{{ userUsername }}</span>

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
