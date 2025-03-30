<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<template>
    <nav>
        <div class="nav-content">
            <div>
                <RouterLink class="router-link" :to="{ name: 'HomeView' }">Home</RouterLink>
            </div>
            <div>
                <button class="button-primary">Login with Discord</button>
            </div>
        </div>
    </nav>
</template>

<style scoped>
nav {
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
</style>
