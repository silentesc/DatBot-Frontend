<script setup lang="ts">
import { onMounted, ref, watchEffect } from 'vue';
import ChannelSelectComponent from '../ChannelSelectComponent.vue';
import { SESSION_ID_COOKIE } from "@/settings.json";
import Cookies from 'js-cookie';
import type { Channel, WelcomeMessage } from '@/models';
import ErrorComponent from '../ErrorComponent.vue';
import LoadingComponent from '../LoadingComponent.vue';
import { putWelcomeMessage, deleteWelcomeMessage as http_utils_deleteWelcomeMessage, getWelcomeMessage } from '@/http_utils/welcome_message';
import { getChannels } from '@/http_utils/guild';

const props = defineProps<{
    guildId: string;
}>();

const isWelcomeMessageSet = ref(false);

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

const saveChanges = async () => {
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

    await putWelcomeMessage(props.guildId, selectedChannelId.value, message.value)
        .then(_ => {
            isWelcomeMessageSet.value = true;
        })
        .catch(e => {
            console.error(e);
            errorMsg.value = e.message;
        });

    loading.value = false;
}

const deleteWelcomeMessage = async () => {
    const sessionId = Cookies.get(SESSION_ID_COOKIE);

    if (!sessionId) {
        return;
    }

    loading.value = true;

    await http_utils_deleteWelcomeMessage(props.guildId)
        .then(_ => {
            isWelcomeMessageSet.value = false;
            selectedChannelId.value = "";
            message.value = "";
        })
        .catch(e => {
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

    await getChannels(props.guildId)
        .then((c: Array<Channel>) => {
            channels.value = c;
        })
        .catch(error => {
            console.error("Error while getting guild channels", error);
            errorMsg.value = "Error while getting guild channels";
        });

    await getWelcomeMessage(props.guildId)
        .then((welcomeMessage: WelcomeMessage | null) => {
            if (welcomeMessage) {
                selectedChannelId.value = welcomeMessage.channel.id;
                message.value = welcomeMessage.message;
                isWelcomeMessageSet.value = true;
            }
        })
        .catch(error => {
            console.error("Error while getting guild channels", error);
            errorMsg.value = "Error while getting guild channels";
        });

    loading.value = false;
});
</script>

<template>
    <div v-if="!loading">
        <h2>
            Status:
            <span :class="{ 'status-green': isWelcomeMessageSet, 'status-red': !isWelcomeMessageSet }">
                {{ (isWelcomeMessageSet) ? "Active" : "Inactive" }}
            </span>
        </h2>

        <h2>Channel</h2>
        <ChannelSelectComponent :channels="channels" v-model="selectedChannelId" />

        <h2>Welcome Message</h2>
        <h3>Helpful variables</h3>
        <p>
            <span>{mention}</span> <span class="help-text">- Mentions the person</span> <br>
            <span>{username}</span> <span class="help-text">- The username of the person</span> <br>
            <span>{server_name}</span> <span class="help-text">- The name of the server</span> <br>
        </p>
        <textarea v-model="message"></textarea>
        <p class="message-length">{{ message.length }} / {{ maxMessageLength }}</p>

        <button class="button button-primary" @click="saveChanges">Save</button>
        <button class="button button-danger" @click="deleteWelcomeMessage">Delete</button>
    </div>

    <LoadingComponent v-if="loading" :is-loading="loading" />

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

.status-green {
    color: var(--color-success);
}

.status-red {
    color: var(--color-danger);
}
</style>
