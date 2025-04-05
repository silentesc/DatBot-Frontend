<script setup lang="ts">
import type { Channel, EmojiRole, Role } from '@/models';
import { ref, watchEffect } from 'vue';
import ErrorComponent from './ErrorComponent.vue';

import data from "emoji-mart-vue-fast/data/all.json";
import "@/assets/emoji-mart-style.css";
import { Picker, EmojiIndex } from "emoji-mart-vue-fast/src";

const props = defineProps({
    isVisible: {
        type: Boolean,
        required: true,
    },
    channels: {
        type: Array<Channel>,
        required: true,
    },
    roles: {
        type: Array<Role>,
        required: true,
    },
});

const emit = defineEmits(["close", "create"]);

const errorMsg = ref<string>("");

const emojiIndex = new EmojiIndex(data);
const isEmojiPickerOpen = ref(false);

const maxMessageLength = ref<number>(2000);

const channelId = ref<string | null>((props.channels.length > 1) ? props.channels[0].id : null);
const type = ref<string>("STANDARD");
const emojiRoles = ref<Array<EmojiRole>>([]);
const message = ref<string>("");

/**
 * LOGIC
 */

const getColorByRoleId = (roleId: string) => {
    const role = props.roles.find(role => role.id === roleId);
    if (!role) {
        return decimalToHex(0);
    }
    return decimalToHex(role.color);
}

const decimalToHex = (decimal: number): string => {
    if (decimal === 0) return "#99aab5";
    return '#' + decimal.toString(16).padStart(6, '0');
};

watchEffect(() => {
    if (message.value.length > maxMessageLength.value) {
        message.value = message.value.slice(0, maxMessageLength.value);
    }
});

const deleteEmojiRole = (emoji: string) => {
    emojiRoles.value = emojiRoles.value.filter((emojiRole) => emojiRole.emoji !== emoji);
}

const handleEmojiSelect = (e: any) => {
    const emoji = e.native;
    if (!emoji || emojiRoles.value.find((emojiRole) => emojiRole.emoji === emoji)) {
        return;
    }

    emojiRoles.value.push({ emoji: emoji, role_id: "" });

    isEmojiPickerOpen.value = false;
}

/**
 * EMITS
 */

const closeModal = () => {
    channelId.value = (props.channels.length > 1) ? props.channels[0].id : null;
    type.value = "STANDARD";
    emojiRoles.value = [];
    message.value = "";
    emit('close');
};

const createReactionRole = () => {
    if (!channelId.value) {
        errorMsg.value = "Channel is not selected";
        return;
    }
    if (!type.value) {
        errorMsg.value = "Type is not selected";
        return;
    }
    if (emojiRoles.value.length < 1) {
        errorMsg.value = "No Emoji/Role Pair exists";
        return;
    }
    if (emojiRoles.value.find(emojiRole => emojiRole.role_id.length < 1)) {
        errorMsg.value = "At least one role is not selected";
        return;
    }
    if (message.value.length < 1) {
        errorMsg.value = "Message is empty.";
        return;
    }
    if (message.value.length > maxMessageLength.value) {
        errorMsg.value = "Message is too long.";
        return;
    }

    emit("create", channelId.value, type.value, emojiRoles.value, message.value);
};
</script>

<template>
    <div v-if="isVisible" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop @click="isEmojiPickerOpen = false">
            <!-- Message -->
            <div>
                <h2>Message</h2>
                <textarea v-model="message"></textarea>
                <p class="message-length">{{ message.length }} / {{ maxMessageLength }}</p>
            </div>

            <!-- Channel -->
            <div>
                <h2>Channel</h2>
                <select id="channel-select" v-if="props.channels" v-model="channelId">
                    <option v-for="channel in props.channels" :key="channel.id" :value="channel.id">
                        #{{ channel.name }}
                    </option>
                </select>
                <p v-else>Loading channels...</p>
            </div>

            <!-- Type -->
            <div>
                <h2>Type</h2>
                <select id="type-select" v-model="type">
                    <option value="STANDARD" key="STANDARD">Standard</option>
                    <option value="UNIQUE" key="UNIQUE">Unique</option>
                </select>
            </div>

            <!-- EmojiRoles -->
            <div>
                <h2>Emoji/Role Pairs</h2>
                <div v-for="emojiRole in emojiRoles" class="emoji-role-card" :key="emojiRole.emoji">
                    <span class="span-emoji">{{ emojiRole.emoji }}</span>
                    <select id="role-select" v-if="props.roles" v-model="emojiRole.role_id"
                        :style="{ color: getColorByRoleId(emojiRole.role_id) }">
                        <option v-for="role in props.roles" :key="role.id" :value="role.id"
                            :style="{ color: decimalToHex(role.color) }">
                            @{{ role.name }}
                        </option>
                    </select>
                    <button class="button button-danger button-delete"
                        @click="deleteEmojiRole(emojiRole.emoji)">✕</button>
                </div>

                <Picker v-if="isEmojiPickerOpen" :data="emojiIndex" set="twitter" title="Select Emoji" @click.stop
                    @select="handleEmojiSelect" show-skin-tones="" />
                <button class="button button-secondary" @click.stop @click="isEmojiPickerOpen = true">Add Emoji/Role
                    Pair</button>
            </div>

            <br> <br>
            <button class="button button-primary" @click="createReactionRole">Create Reaction Role</button>

            <ErrorComponent v-if="errorMsg.length > 0" :is-visible="errorMsg.length > 0" :error-message="errorMsg" @close="errorMsg = ''" />
        </div>
    </div>
</template>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background: var(--background-secondary);
    width: 40%;
    min-width: 300px;
    height: 80%;
    border-radius: 8px;
    padding: var(--padding-large);
    position: relative;
    overflow: auto;
}

textarea {
    width: 100%;
    height: 10rem;
    min-height: 2rem;
    max-height: 25rem;
    background-color: var(--background-primary);
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

select {
    width: 100%;
    padding: var(--padding-small);
    border: none;
    border-radius: 4px;
    background-color: var(--background-primary);
    color: #fff;
    font-size: 1.2rem;
    outline: none;
}

option {
    background-color: var(--background-secondary);
    color: #fff;
    font-size: 1.2rem;
    padding: var(--padding-small);
}

.emoji-role-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: var(--margin-small);
    margin-bottom: var(--margin-small);
    width: 100%;
    height: 70px;
    background-color: var(--background-primary);
}

.span-emoji {
    margin: var(--margin-large);
    font-size: 2rem;
    cursor: default;
}

#role-select {
    margin: var(--margin-small);
    background-color: var(--background-secondary);
}

.button-delete {
    min-width: 50px;
}
</style>
