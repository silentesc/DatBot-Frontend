<script setup lang="ts">
import { ref } from 'vue';
import router from '@/router';
import { session } from '@/session-manager.ts';
import axios from 'axios';
import settings from "@/settings.json";

const showFeatures = ref(false);

const toggleFeatures = () => {
    showFeatures.value = !showFeatures.value;
};

const login_with_discord = async () => {
    await axios.get(`${settings.BACKEND_URL}/auth/login`)
        .then((response) => {
            window.location.href = response.data;
        });
}

const goToDashboard = () => {
    if (!session.value) {
        login_with_discord();
    } else {
        router.push({ name: 'HomeView' });
    }
};
</script>

<template>
    <div class="landing-page">
        <header class="landing-header">
            <h1>DatBot!</h1>
            <p>Manage your DatBot here!</p>
            <button class="primary-button" @click="goToDashboard">Go to Dashboard</button>
        </header>

        <section class="landing-features">
            <h2>Functions</h2>
            <div class="features-grid">
                <div class="feature-item">
                    <h3>Simple</h3>
                    <p>Configure your bot with just a few clicks.</p>
                </div>
                <div class="feature-item">
                    <h3>Command Overview</h3>
                    <p>All your bot commands at a glance.</p>
                </div>
                <div class="feature-item">
                    <h3>Statistics</h3>
                    <p>Keep an eye on your bot's usage.</p>
                </div>
            </div>
            <button v-if="!showFeatures" @click="toggleFeatures" class="secondary-button">Show More Functions</button>
            <div v-if="showFeatures" class="features-grid">
                <div class="feature-item">
                    <h3>Reaction Roles</h3>
                    <p>Easy management of Reaction Roles.</p>
                </div>
                <div class="feature-item">
                    <h3>Welcome Messages</h3>
                    <p>Customize your welcome messages.</p>
                </div>
                <div class="feature-item">
                    <h3>Custom Commands</h3>
                    <p>Create your own bot commands.</p>
                </div>
            </div>
            <button v-if="showFeatures" @click="toggleFeatures" class="secondary-button">Show Fewer Functions</button>
        </section>

        <section class="landing-cta">
            <h2>Ready to get started?</h2>
            <p>Connect your Discord Bot and get going!</p>
            <button class="primary-button" @click="goToDashboard">Go to Dashboard</button>
        </section>

        <footer class="landing-footer">
            <p>&copy; 2025 DatBot</p>
        </footer>
    </div>
</template>

<style lang="css" scoped>
.landing-page {
    font-family: 'Arial', sans-serif;
    background-color: var(--background);
    color: #fff;
    padding: 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.landing-header {
    text-align: center;
    margin-bottom: 60px;
}

.landing-header h1 {
    font-size: 2.5em;
    margin-bottom: 10px;
    color: var(--accent);
}

.landing-header p {
    font-size: 1.1em;
    color: #ccc;
    margin-bottom: 20px;
}

.landing-features {
    width: 80%;
    max-width: 1200px;
    margin-bottom: 60px;
    text-align: center;
}

.landing-features h2 {
    font-size: 2em;
    margin-bottom: 30px;
    color: var(--secondary);
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;
    margin-bottom: 30px;
}

.feature-item {
    background-color: #222;
    padding: 25px;
    border-radius: 8px;
    border: 1px solid #333;
    transition: transform 0.2s ease-in-out;
}

.feature-item:hover {
    transform: translateY(-5px);
}

.feature-item img {
    width: 60px;
    height: 60px;
    margin-bottom: 15px;
    filter: invert(70%);
}

.feature-item h3 {
    font-size: 1.4em;
    margin-bottom: 10px;
    color: var(--accent);
}

.feature-item p {
    color: #bbb;
}

.landing-cta {
    text-align: center;
    margin-bottom: 60px;
}

.landing-cta h2 {
    font-size: 2em;
    margin-bottom: 20px;
    color: var(--secondary);
}

.landing-cta p {
    font-size: 1.1em;
    color: #ccc;
    margin-bottom: 30px;
}

.landing-footer {
    text-align: center;
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid #333;
    color: #777;
    font-size: 0.9em;
}

.primary-button,
.secondary-button {
    padding: 12px 25px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1em;
    transition: background-color 0.3s ease;
}

.primary-button {
    background-color: var(--secondary);
    color: white;
    border: none;
}

.primary-button:hover {
    background-color: var(--accent);
}

.secondary-button {
    background-color: transparent;
    color: var(--secondary);
    border: 1px solid var(--secondary);
}

.secondary-button:hover {
    background-color: #333;
}
</style>