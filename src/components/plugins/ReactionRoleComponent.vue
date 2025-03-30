<script setup lang="ts">
import axios from 'axios';
import { onMounted, ref } from 'vue';
import Cookies from 'js-cookie';

import { SESSION_ID_COOKIE, BACKEND_URL } from "@/settings.json";
import type { Channel, ReactionRole, Role } from '@/models';

const props = defineProps<{
    guildId: string;
}>();

const reactionRoles = ref<Array<ReactionRole> | null>(null);
const channels = ref<Array<Channel> | null>(null);
const roles = ref<Array<Role> | null>(null);

/**
 * LOGIC
 */
const decimalToHex = (decimal: number): string => {
    return '#' + decimal.toString(16).padStart(6, '0');
};

/**
 * API CALLS
 */

const deleteReactionRole = async (channelId: string, messageId: string) => {
    const sessionId = Cookies.get(SESSION_ID_COOKIE);

    if (!sessionId) {
        return;
    }

    await axios.delete(`${BACKEND_URL}/reaction_role/reaction_role`, {
        params: {
            session_id: sessionId,
            guild_id: props.guildId,
            channel_id: channelId,
            message_id: messageId,
        },
    })
    .then((_) => {
        window.location.reload();
    })
    .catch((error) => {
        console.error("Error while deleting reaction role:", error);
    });
}

/**
 * LIFECYCLE
 */
onMounted(async () => {
    const sessionId = Cookies.get(SESSION_ID_COOKIE);

    if (!sessionId) {
        return;
    }

    axios.get(`${BACKEND_URL}/reaction_role/reaction_roles`, {
        params: { session_id: sessionId, guild_id: props.guildId },
    })
        .then((response) => {
            reactionRoles.value = response.data;
        })
        .catch((error) => {
            console.error("Error while getting reaction roles", error);
        });

    axios.get(`${BACKEND_URL}/user/guild_channels`, {
        params: { session_id: sessionId, guild_id: props.guildId },
    })
        .then((response) => {
            channels.value = response.data;
            if (channels.value) {
                channels.value = channels.value.filter((channel) => channel.type === 0);
            }
        })
        .catch((error) => {
            console.error("Error while getting guild channels", error);
        });

    axios.get(`${BACKEND_URL}/user/guild_roles`, {
        params: { session_id: sessionId, guild_id: props.guildId },
    })
        .then((response) => {
            roles.value = response.data;
            if (roles.value) {
                roles.value = roles.value.filter((role) => role.name !== "@everyone" && !role.managed).sort((a, b) => b.position - a.position);
            }
        })
        .catch((error) => {
            console.error("Error while getting guild roles", error);
        });
});
</script>

<template>
    <h1>Existing reaction roles</h1>
    <table v-if="reactionRoles && reactionRoles.length">
        <thead>
            <tr>
                <th>Channel Name</th>
                <th>Type</th>
                <th>Emoji</th>
                <th>Role Name</th>
                <th style="width: 1%;">Delete</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="reactionRole in reactionRoles" :key="reactionRole.channel_name">
                <td>#{{ reactionRole.channel_name }}</td>
                <td>{{ reactionRole.type }}</td>
                <td>
                    <div v-for="emojiRole in reactionRole.emoji_roles" :key="emojiRole.emoji">
                        {{ emojiRole.emoji }}
                    </div>
                </td>
                <td>
                    <div v-for="emojiRole in reactionRole.emoji_roles" :key="emojiRole.role_name">
                        <span :style="{ color: decimalToHex(emojiRole.role_color) }">@{{ emojiRole.role_name }}</span>
                    </div>
                </td>
                <td>
                    <button class="button-danger" @click="deleteReactionRole(reactionRole.channel_id, reactionRole.message_id)">Delete</button>
                </td>
            </tr>
        </tbody>
    </table>

    <h2 v-else>No reaction roles yet...</h2>

    <h1>Create a new reaction role</h1>
    <!-- TODO -->
</template>

<style scoped>
table {
    width: 100%;
    border-collapse: collapse;
}

thead {
    background-color: var(--background-secondary);
}

th,
td {
    border: 1px solid #ddd;
    padding: var(--padding-small);
    text-align: left;
}

th {
    font-weight: bold;
}

tr:nth-child(even) {
    background-color: var(--background-secondary);
}
</style>
