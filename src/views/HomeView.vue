<script setup lang="ts">
import Cookies from 'js-cookie';
import { SESSION_ID_COOKIE, BACKEND_URL } from "@/settings.json";
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();

const sessionId = ref<string | undefined>(Cookies.get(SESSION_ID_COOKIE));

const viewGuilds = () => {
    router.push({ name: "GuildsView" });
}

const login = () => {
    const login = async () => {
        await axios.get(`${BACKEND_URL}/auth/login`)
            .then((response) => {
                window.location.href = response.data;
            })
            .catch((error) => {
                console.error("Error while getting login url:", error);
            });
    }
}
</script>

<template>
    <div class="home">
        <!-- Hero Section -->
        <section class="hero">
            <div class="hero-content">
                <h1>Welcome to DatBot</h1>
                <p>
                    Your Discord Bot to customize your server seamlessly.
                    <br>
                    Free. No ads. No data selling.
                </p>
                <button v-if="sessionId" @click="viewGuilds" class="button button-primary">Go to Dashboard</button>
                <button v-else @click="login" class="button button-primary">Login with Discord</button>
            </div>
        </section>

        <!-- Features Section -->
        <section class="features">
            <h2>Features</h2>
            <div class="features-grid">
                <div class="feature-card">
                    <img src="@/assets/images/reaction-roles.png" alt="Reaction Roles" />
                    <div class="feature-info">
                        <h3>Reaction Roles</h3>
                        <p>Effortlessly assign roles with interactive reactions.</p>
                    </div>
                </div>
                <div class="feature-card">
                    <img src="@/assets/images/welcome.jpg" alt="Welcome Messages" />
                    <div class="feature-info">
                        <h3>Welcome Messages</h3>
                        <p>Create custom greetings to welcome new members.</p>
                    </div>
                </div>
                <div class="feature-card">
                    <img src="@/assets/images/welcome.jpg" alt="Auto Roles" />
                    <div class="feature-info">
                        <h3>Auto Roles</h3>
                        <p>Asign roles automatically to new members.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Introduction Section -->
        <section class="introduction">
            <div class="intro-image">
                <img src="@/assets/images/bot-intro.png" alt="Bot Introduction" />
            </div>
            <div class="intro-text">
                <h2>About DatBot</h2>
                <p>
                    DatBot is designed to make your life easier. Nobody wants to spend 30 minutes trying to get
                    something simple working. That's why this project tries to make setting things up as intuitive as
                    possible!
                    <br> <br>
                    This project is developed by a single person for fun, yet it has been made available for
                    everyone to enjoy. That's why you won't find any ads or subscription-based features here.
                </p>
            </div>
        </section>

        <!-- Footer -->
        <footer class="footer">
            <p>Modern. Customizable. Reliable. DatBot - Your Ultimate Discord Companion.</p>
        </footer>
    </div>
</template>

<style scoped>
h1,
h2 {
    color: var(--color-primary)
}

.home {
    font-family: var(--font-family);
}

/* Hero Section */
.hero {
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    background-color: var(--background-tertiary);
    position: relative;
    height: 40vh;
    min-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.hero-content {
    position: relative;
    text-align: center;
    color: #fff;
    padding: 0 1rem;
}

.hero-content h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.hero-content p {
    font-size: 1.25rem;
    margin-bottom: 2rem;
}

/* Features Section */
.features {
    padding: 4rem 2rem;
    background-color: var(--background-secondary);
}

.features h2 {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 2rem;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
}

.feature-card {
    background-color: var(--background-tertiary);
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s, box-shadow 0.3s;
}

.feature-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
}

.feature-card img {
    display: block;
    width: 100%;
    height: auto;
}

.feature-info {
    padding: 1rem;
}

.feature-info h3 {
    color: #fff;
    margin-bottom: var(--margin-small);
}

.feature-info p {
    color: var(--color-secondary);
}

/* Introduction Section */
.introduction {
    background-color: var(--background-tertiary);
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    padding: 4rem 2rem;
    gap: 2rem;
}

.intro-image {
    flex: 1 1 300px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.intro-image img {
    width: 80%;
    border-radius: 8px;
}

.intro-text {
    flex: 1 1 300px;
}

.intro-text h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
}

.intro-text p {
    font-size: 1.1rem;
}

/* Footer */
.footer {
    background-color: var(--background-secondary);
    text-align: center;
    font-size: 1rem;
    position: absolute;
    left: 0;
    width: 100%;
}
</style>
