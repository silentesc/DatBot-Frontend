<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Cookies from 'js-cookie';
import ReactionRoleCreatorComponent from '../ReactionRoleCreatorComponent.vue';

import { SESSION_ID_COOKIE } from "@/settings.json";
import type { Channel, EmojiRole, ReactionRole, Role } from '@/models';
import LoadingComponent from '../LoadingComponent.vue';
import { postReactionRole, deleteReactionRole as http_utils_deleteReactionRole, getReactionRoles } from '@/http_utils/reaction_role';
import { getChannels, getRoles } from '@/http_utils/guild';
import ErrorComponent from '../ErrorComponent.vue';
import { decimalToHex } from '@/utils/color_utils';

const props = defineProps<{
    guildId: string;
}>();

const loading = ref(false);
const errorMsg = ref("");

const isReactionRoleCreationInProgress = ref<boolean>(false);

const reactionRoles = ref<Array<ReactionRole> | null>(null);
const channels = ref<Array<Channel> | null>(null);
const roles = ref<Array<Role> | null>(null);

const isCreateReactionRoleModalVisible = ref(false);

/**
 * API CALLS
 */

const createReactionRole = async (channelId: string, type: string, emojiRoles: Array<EmojiRole>, message: string) => {
    isReactionRoleCreationInProgress.value = true;

    await postReactionRole(props.guildId, channelId, type, message, emojiRoles)
        .then(_ => {
            isReactionRoleCreationInProgress.value = false;
            window.location.reload();
        })
        .catch(error => {
            console.error("Creating a creation role failed with error:", error);
            errorMsg.value = error.response.data.detail;
        });

    isReactionRoleCreationInProgress.value = false;
}

const deleteReactionRole = async (channelId: string, messageId: string) => {
    const sessionId = Cookies.get(SESSION_ID_COOKIE);

    if (!sessionId) {
        return;
    }

    loading.value = true;

    await http_utils_deleteReactionRole(props.guildId, channelId, messageId)
        .then(_ => {
            window.location.reload();
        })
        .catch((error) => {
            console.error("Error while deleting reaction role:", error);
            errorMsg.value = error.response.data.detail;
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

    getReactionRoles(props.guildId)
        .then((rr: Array<ReactionRole>) => {
            reactionRoles.value = rr;
        })
        .catch(error => {
            console.error("Error while getting reaction roles", error);
            errorMsg.value = error.response.data.detail;
        });

    getChannels(props.guildId)
        .then((c: Array<Channel>) => {
            channels.value = c;
        })
        .catch(error => {
            console.error("Error while getting guild channels", error);
            errorMsg.value = error.response.data.detail;
        });

    getRoles(props.guildId)
        .then((r: Array<Role>) => {
            roles.value = r;
        })
        .catch((error) => {
            console.error("Error while getting guild roles", error);
            errorMsg.value = error.response.data.detail;
        });

    loading.value = false;
});
</script>

<template>
    <h1>Existing reaction roles</h1>
    <div v-if="reactionRoles && reactionRoles.length > 0">
        <table>
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
                            <span :style="{ color: decimalToHex(emojiRole.role_color) }">
                                @{{ emojiRole.role_name }}
                            </span>
                        </div>
                    </td>
                    <td>
                        <button class="button button-danger"
                            @click="deleteReactionRole(reactionRole.channel_id, reactionRole.message_id)">Delete</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <LoadingComponent v-if="loading" :is-loading="loading" />

    <LoadingComponent v-if="isReactionRoleCreationInProgress" :is-loading="isReactionRoleCreationInProgress"
        message="Your reaction role is being created. If you have many emojis attached, this may take a few seconds." />

    <h2 v-if="reactionRoles !== null && reactionRoles.length === 0">No reaction roles yet...</h2>

    <ReactionRoleCreatorComponent v-if="channels && roles" :is-visible="isCreateReactionRoleModalVisible"
        :channels="channels" :roles="roles" @close="isCreateReactionRoleModalVisible = false"
        @create="createReactionRole" />

    <button v-if="reactionRoles !== null" class="button button-primary"
        @click="isCreateReactionRoleModalVisible = true">
        Create Reaction Role
    </button>

    <ErrorComponent v-if="errorMsg.length > 0" :is-visible="errorMsg.length > 0" :error-message="errorMsg"
        @close="errorMsg = ''" />
</template>

<style scoped>
table {
    width: 100%;
    border-collapse: collapse;
    background-color: var(--background-tertiary);
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
