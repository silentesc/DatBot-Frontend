<script setup lang="ts">
import type { Session } from '@/models';
import { SESSION_ID_COOKIE, BACKEND_URL } from '@/settings.json'
import axios from 'axios';
import Cookies from 'js-cookie';
import { ref, defineEmits, onMounted } from 'vue';
import { RouterLink } from 'vue-router';

const props = defineProps<{
    session: Session | null;
}>();

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
        .then((_) => {
            console.log("Logged out successfully.");
        })
        .catch((error) => {
            console.error("Error during logout:", error);
        });

    console.log("Removing cookie");
    Cookies.remove(SESSION_ID_COOKIE);

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

    console.log("Validating session");
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
                <RouterLink class="router-link" :to="{ name: 'DashboardView' }">Dashboard</RouterLink>
            </div>
            <div>
                <div v-if="props.session">
                    <div class="user-container" @click="toggleDropdown">
                        <img class="user-avatar"
                            :src="`https://cdn.discordapp.com/avatars/${props.session.user.id}/${props.session.user.avatar}.png`"
                            alt="User Avatar">
                        <span class="user-username">{{ props.session.user.username }}</span>

                        <!-- Dropdown menu -->
                        <div v-if="dropdownOpen" class="dropdown-menu">
                            <p class="dropdown-item" @click.stop="logout">Logout</p>
                        </div>
                    </div>
                </div>
                <button v-else class="button-primary" @click="login">Login with Discord</button>
            </div>
        </div>
    </nav>
</template>

<style scoped>
nav {
    height: 40px;

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
