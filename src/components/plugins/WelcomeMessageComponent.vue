<script setup lang="ts">
import { onMounted, ref, watchEffect } from 'vue';
import ChannelSelectComponent from '../ChannelSelectComponent.vue';
import { BACKEND_URL, SESSION_ID_COOKIE } from "@/settings.json";
import axios from 'axios';
import Cookies from 'js-cookie';
import type { Channel, WelcomeMessage } from '@/models';
import ErrorComponent from '../ErrorComponent.vue';
import LoadingComponent from '../LoadingComponent.vue';

const props = defineProps<{
    guildId: string;
}>();

const channels = ref<Array<Channel>>([]);
const selectedChannelId = ref<string | undefined>(undefined);

const maxMessageLength = ref<number>(2000);
const message = ref<string>("");

const errorMsg = ref<string>("");
const loading = ref<boolean>(false);

/**
 * LOGIC
 */
watchEffect(() => {
    if (message.value.length > maxMessageLength.value) {
        message.value = message.value.slice(0, maxMessageLength.value);
    }
});

const saveChanges = () => {
    const sessionId = Cookies.get(SESSION_ID_COOKIE);

    if (!sessionId) {
        return;
    }

    if (!selectedChannelId.value) {
        errorMsg.value = "Select a channel";
        return;
    }
    if (message.value.length <= 0) {
        errorMsg.value = "Message cannot be empty"
        return;
    }

    loading.value = true;

    axios.put(`${BACKEND_URL}/welcome_message/welcome_message`, null, {
        params: {
            session_id: sessionId,
            guild_id: props.guildId,
            channel_id: selectedChannelId.value,
            message: message.value,
        }
    }).then((_) => {
        window.location.reload();
    }).catch((e) => {
        console.error(e);
        errorMsg.value = e.message;
    });

    loading.value = false;
}

const deleteWelcomeMessage = () => {
    const sessionId = Cookies.get(SESSION_ID_COOKIE);

    if (!sessionId) {
        return;
    }

    loading.value = true;

    axios.delete(`${BACKEND_URL}/welcome_message/welcome_message`, {
        params: {
            session_id: sessionId,
            guild_id: props.guildId,
        }
    }).then((_) => {
        window.location.reload();
    }).catch((e) => {
        console.error(e);
        errorMsg.value = e.message;
    });

    loading.value = false;
}

/**
 * LIFECYCLE
 */
onMounted(async () => {
    const sessionId = Cookies.get(SESSION_ID_COOKIE);

    if (!sessionId) {
        return;
    }

    loading.value = true;

    await axios.get(`${BACKEND_URL}/guild/channels`, {
        params: { session_id: sessionId, guild_id: props.guildId },
    })
        .then((response) => {
            let tempChannels: Array<Channel> = response.data;
            const textChannels = tempChannels.filter((channel) => channel.type === 0);
            const categoryChannels = tempChannels.filter((channel) => channel.type === 4).sort(function (a, b) { return a.position - b.position });

            channels.value = []
            for (const categoryChannel of categoryChannels) {
                channels.value.push(categoryChannel);
                const textChannelsToAdd: Array<Channel> = textChannels.filter(textChannel => textChannel.parent_id === categoryChannel.id).sort(function (a, b) { return a.position - b.position });
                channels.value.push(...textChannelsToAdd);
            }
        })
        .catch((error) => {
            console.error("Error while getting guild channels", error);
        });

    await axios.get(`${BACKEND_URL}/welcome_message/welcome_message`, {
        params: { session_id: sessionId, guild_id: props.guildId },
    })
        .then((response) => {
            if (response.data) {
                const welcomeMessage: WelcomeMessage = response.data;
                selectedChannelId.value = welcomeMessage.channel.id;
                message.value = welcomeMessage.message;
            }
        })
        .catch((error) => {
            console.error("Error while getting guild channels", error);
        });
    
    loading.value = false;
});
</script>

<template>
    <h3>Helpful variables</h3>
    <p>
        <span>{mention}</span> <span class="help-text">- Mentions the person</span> <br>
        <span>{username}</span> <span class="help-text">- The username of the person</span> <br>
        <span>{server_name}</span> <span class="help-text">- The name of the server</span> <br>
    </p>

    <div v-if="!loading">
        <h2>Channel</h2>
        <ChannelSelectComponent :channels="channels" v-model="selectedChannelId" />
    
        <h2>Welcome Message</h2>
        <textarea v-model="message"></textarea>
        <p class="message-length">{{ message.length }} / {{ maxMessageLength }}</p>
    
        <button class="button button-primary" @click="saveChanges">Save</button>
        <button class="button button-danger" @click="deleteWelcomeMessage">Delete</button>
    </div>

    <LoadingComponent v-if="loading" :is-loading="loading"/>

    <ErrorComponent v-if="errorMsg.length > 0" :is-visible="errorMsg.length > 0" :error-message="errorMsg"
        @close="errorMsg = ''" />
</template>

<style>
textarea {
    width: 100%;
    height: 15rem;
    min-height: 2rem;
    max-height: 30rem;
    background-color: var(--background-secondary);
    color: #fff;
    font-family: var(--font-family);
    font-size: 1.3rem;
    resize: vertical;
    border: none;
    outline: none;
}

.message-length {
    margin: 0;
}

.help-text {
    color: var(--color-secondary);
}

.button {
    margin: var(--margin-normal);
}
</style>
